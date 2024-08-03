var w = 1200;
var h = 500;
var baseLine = h/2;
var margin = 20;


var svg = d3.select("#canvas").append("svg")
			.attr("width",w)
			.attr("height",h)
			.style("background-color","black")


			
const years = [2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024]; // List of years
const months = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"]; // List of months
const snowMonths = ["october", "november", "december", "january", "february", "march", "april"]

const data = {};

const parseNumber = (str) => {
	if (str) {
	  // Replace comma with dot and parse as float
	  return parseFloat(str.replace(',', '.'));
	}
	return null; // Return null if the string is empty or undefined
  };
// Function to load and parse temperature CSV data
async function loadTempCSV(year, month) {
	const filename = `data/${year}_${month}_temp.csv`;
	try {
	  // Specify semicolon as the delimiter
	  const data = await d3.dsv(';',filename, d => {
		// Function to handle conversion of comma to dot in numbers
		
		return {
		  date: new Date(d["DateTime"]),
		  laveste: parseNumber(d["Laveste"]),
		  hojeste: parseNumber(d["Højeste"]),
		  middel: parseNumber(d["Middel"])
		};
	  });
  
	  return data;
	} catch (error) {
	  console.warn(`Failed to load temperature data for ${year} ${month}:`, error);
	  return null; // Return null or an empty array if file not found
	}
  }
  
  
  
  // Function to load and parse snow CSV data
  // Function to load and parse snow CSV data
async function loadSnowCSV(year, month) {
	const filename = `data/${year}_${month}_snow.csv`;
	try {
	  return await d3.dsv(';', filename, d => {
		const date = new Date(d["DateTime"]);
		const hours = date.getHours();
		const minutes = date.getMinutes();
		const seconds = date.getSeconds();
		
		// Only include data with time `07:00:00`
		if (hours === 7 && minutes === 0 && seconds === 0) {
		  const dateOnly = new Date(date.setHours(0, 0, 0, 0));
		  return {
			date: dateOnly,
			maxSnowDepth: parseNumber(d["Maks. snedybde"])
		  };
		}
		return null; // Exclude records that do not meet the condition
	  }).then(data => data.filter(d => d !== null)); // Filter out null values
	} catch (error) {
	  console.warn(`Failed to load snow data for ${year} ${month}:`, error);
	  return [];
	}
  }

// Load and merge temperature and snow data
async function loadAllData() {
	for (const year of years) {
	  data[year] = {};
	  for (const month of months) {
		const tempData = await loadTempCSV(year, month);
		const snowData = await loadSnowCSV(year, month);
		
		if(tempData != null && snowData != null){
			const combinedData = {};
			
			// Index temperature data by date
			tempData.forEach(record => {
			if (record.date) {
				combinedData[record.date.toISOString()] = {
				date: record.date,
				laveste: record.laveste,
				hojeste: record.hojeste,
				middel: record.middel,
				maxSnowDepth: null //temp for snow data
				};
			}
			});
			
			// Merge snowfall data into the combined data
			snowData.forEach(record => {
			if (record.date) {
				const dateKey = record.date.toISOString();
				if (combinedData[dateKey]) {
					combinedData[dateKey].maxSnowDepth = record.maxSnowDepth;
				}
			}
			});
			
			// Convert combinedData object to an array
			const mergedDataArray = Object.values(combinedData);
			
			data[year][month] = mergedDataArray;
		}
	  }
	}
	console.log(data); // Log the entire data object
  }

// Load the data
loadAllData();

//How to access a year:
//data[2015]["january"][0].date.getFullYear()

var xScale = d3.scaleLinear()
  				.domain([-20,20])
				.range(margin, h-margin);
var dayScale = d3.scaleLinear()
                .domain([0, 31])
                .range([0, ((w-margin)-margin)/snowMonths.length]);
var monthScale = d3.scaleLinear()
					.domain(snowMonths)
					.range([margin, w-margin]);

var colorScale = d3.scaleOrdinal()
				.domain(years)
				.range(d3.schemeCategory10);

/*

//define a recursive function for making the lines
function makeRainLines(g, startX, startY, previousAngle, num, Data){
	console.log(Data.data.length)
	if(num >= Data.data.length){
		console.log("Done" + num)
		return;
	}

	// Convert angle from degrees to radians
    var angleRad = (Data.data[num]+previousAngle) * Math.PI / 180;
	var length = num*(h/18);

    // Calculate endpoint coordinates
    var endX = startX + length * Math.cos(angleRad);
    var endY = startY + length * Math.sin(angleRad);

	g.append("line")
		.attr("x1", startX)
		.attr("y1", startY)
		.attr("x2", endX)
		.attr("y2", endY)
		.attr("stroke", "transparent")
		.attr("stroke-width", 10)
	g.append("line")
		.attr("x1", startX)
		.attr("y1", startY)
		.attr("x2", endX)
		.attr("y2", endY)
		.attr("stroke", function(){
			return colorScale(Data.name);
		})
        .attr("stroke-width", 2);

	if(num+1 != Data.data.length){
		//Dotted line
		g.append("line")
			.attr("x1", endX)
			.attr("y1", endY)
			.attr("x2", endX + (length/3) * Math.cos(angleRad))
			.attr("y2", endY + (length/3) * Math.sin(angleRad))
			.attr("stroke", function(){
				return colorScale(Data.name);
			})
			.attr("stroke-width", 1)
			.attr("stroke-dasharray", "3, 3");
		
		var arc = d3.arc()
			.innerRadius(length/4-1)   // The inner radius of the arc. Setting it to 0 creates a pie slice.
			.outerRadius(length/4) // The outer radius of the arc.
			.startAngle((Data.data[num]+previousAngle +90) * Math.PI / 180)    // The starting angle of the arc in radians.
			.endAngle((Data.data[num+1]+Data.data[num]+previousAngle+90) * Math.PI / 180); // The ending angle of the arc in radians. This creates a quarter circle.
		
		g.append("path")
			.attr("d", arc)
			.attr("fill", function(){
				return colorScale(Data.name);
			})
			.attr("transform", `translate(${endX},${endY})`); // Move the arc to a specific position
		g.append("text")
			.attr("x", endX)
			.attr("y", endY)
			.text(`${Data.data[num]}💧`) //°
			.style("fill", "white")
			.style("font-size", "15px")
			.style("fill", "yellow")
			.style("text-shadow", "6px 6px 12px rgba(0, 0, 0, 1)") // Add shadow for better visibility
			.style("display", "none") // Hide the text initially
			.attr("class", "hover-text"); // Add a class to this text element
	}

	makeRainLines(g, endX,endY,(Data.data[num]+previousAngle), num+1, Data);
}

var minRainName = d3.min(rainDrops, d => d.data[d.data.length-1])
var maxRainName = d3.max(rainDrops, d => d.data[d.data.length-1])
rainDrops.forEach(function(d, i) {
	console.log("min" + minRainName)
	console.log("max" + maxRainName)
    var g = svg.append("g")
               .attr("transform", `translate(${0},${0})`);
	// Add event listeners to the group
    g.on("mouseover", function() {
        // Fade out all groups except the hovered one
        svg.selectAll("g")
           .style("opacity", function() {
               return (this === g.node()) ? 1 : 0.4; // Keep hovered group fully visible
           });
		g.selectAll(".hover-text")
           .style("display", "block"); // Show text on hover
    })
    .on("mouseout", function() {
        // Restore full opacity to all groups on mouseout
        svg.selectAll("g")
           .style("opacity", 1);
		g.selectAll(".hover-text")
           .style("display", "none"); // Hide text on mouseout
    });

    makeRainLines(g, w/2 + 100, h/4, Math.PI / 4, 0, d);
	
	g.append("text")
		.attr("x", w-125)
		.attr("y", h-50 - (i*30))
		.text(`${d.name}`)
		.style("fill", function(){
			return colorScale(d.name);
		})
		.style("font-size", "25px")
	//add button
	if (d.data[d.data.length-1] === minRainName){
		g.append("text")
			.text("Person with least amount of rain observed")
			.attr("x", 50)
			.attr("y", 350)
			.style("fill", "CornflowerBlue")
			.style("text-decoration", "underline")
	}
	if (d.data[d.data.length-1] === maxRainName){
		g.append("text")
			.text("Person with the most amount of rain observed")
			.attr("x", 50)
			.attr("y", 375)
			.style("fill", "CornflowerBlue")
			.style("text-decoration", "underline")
	}


});

//Title
svg.append("text")
   .attr("x", 50)
   .attr("y", 65)
   .style("fill", "white")
   .text("Rain oberservations visualised")
   .style("font-size", "35px")

//Legend
svg.append("text")
   .attr("x", 50)
   .attr("y", 100)
   .style("fill", "white")
   .selectAll("tspan")
   .data(["This data shows the observations", "of amount of raindrops landing on", 
   			"a persons face, depending on how many steps.", " ", "The length of the line is amount",
			"of steps, ranging from 10-60, and", "the angle is the amount of raindrops.",
			"You can try to hover over either the lines,", "or the names to see more details."])
   .enter()
   .append("tspan")
   .attr("x", 50)
   .attr("dy", (d, i) => (i === 0 ? 0 : 23)) // Adjust the spacing as needed
   .text(d => d);

   */