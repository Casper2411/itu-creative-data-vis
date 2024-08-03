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

//Here all data will be stored:
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
async function loadSnowCSV(year, month) {
	const filename = `data/${year}_${month}_snow.csv`;
	try {
	  return await d3.dsv(';', filename, d => {
		const date = new Date(d["DateTime"]);
		const maxSnowDepth = parseNumber(d["Maks. snedybde"]);
		
		// Only include data where the data is not null
		if (maxSnowDepth !== null) {
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


var endWinter = ["october", "november", "december"]
// Load and merge temperature and snow data
async function loadAllData() {
	for (const year of years) {
	  data[year] = {};
	  for (const month of snowMonths) {

		var tempData = null;
		var snowData = null;
		if(endWinter.includes(month)){
			tempData = await loadTempCSV(year, month);
			snowData = await loadSnowCSV(year, month);
		}else{
			tempData = await loadTempCSV(year+1, month);
			snowData = await loadSnowCSV(year+1, month);
		}
		
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
			console.log("Wof")
			console.log(month)
			console.log(snowData.length)
			
			// Merge snowfall data into the combined data
			snowData.forEach(record => {
			if (record.date) {
				console.log("yes")
				const dateKey = record.date.toISOString();
				if (combinedData[dateKey]) {
					combinedData[dateKey].maxSnowDepth = record.maxSnowDepth;
				}else{
					console.log("WAAOOw")
					console.log(dateKey)
					console.log(combinedData)
				}
			}
			else{
				console.log("WAAOOw2")
				console.log(record)
				console.log(combinedData)
			}
			});
			
			// Convert combinedData object to an array
			const mergedDataArray = Object.values(combinedData);
			
			data[year][month] = mergedDataArray;
		}
	  }
	}
	console.log(data); // Log the entire data object
	return data;
  }

// Load the data
loadAllData().then(function(loadedData) {
    // Now data is fully loaded, and ready for drawing
    draw(loadedData);
});

//How to access a year:
//data[2015]["january"][0].date.getFullYear()

//Poistioning on y axis
var yScale = d3.scaleLinear()
  				.domain([-20.0,20.0])
				.range([margin, h-margin]);


//Poistioning on xScale is done later


//Here the size of each month is approximately ((w-margin)-margin)/snowMonths.length
var monthScale = d3.scaleBand()
					.domain(snowMonths)
					.range([margin, w-margin]);

var colorScale = d3.scaleOrdinal()
				.domain(years)
				.range(d3.schemeCategory10);

function makeSnowTempGraph(g, thisYear, yearData){
	function drawOneMonth(month, monthData, nextTempPos, nextSnowPos){

		// Convert the monthData object to an array of values
        const monthDataArray = Object.values(monthData);

		function dayScale(index){
			var retValue = margin + (index*((w-(margin*2))/snowMonths.length)/monthDataArray.length);
			return retValue;
		}

		monthDataArray.forEach((element, index, array) => {
			var nextElement = index < array.length - 1 ? array[index + 1] : null;
			
			//Check if end of month, and the line should connect
			if(index === (array.length - 1)){
				nextElement = nextTempPos;
			}

			if(nextElement !== null){

				//Transparent line in background to make hover easier.
				g.append("line")
					.attr("x1", function(){
						return monthScale(month) + dayScale(index);
					})
					.attr("y1", function(){
						return yScale(element.laveste);
					})
					.attr("x2", function(){
						return monthScale(month) + dayScale(index+1);
					})
					.attr("y2", function(){
						return yScale(nextElement.laveste);
					})
					.attr("stroke", "transparent")
					.attr("stroke-width", 8);
				
				//The line showing the lower temperature.
				g.append("line")
					.attr("x1", function(){
						return monthScale(month) + dayScale(index);
					})
					.attr("y1", function(){
						return yScale(element.laveste);
					})
					.attr("x2", function(){
						return monthScale(month) + dayScale(index+1);
					})
					.attr("y2", function(){
						return yScale(nextElement.laveste);
					})
					.attr("stroke", function(){
						return colorScale(thisYear)
					});
			}
		});
	}

	//Here snowMonths is used for inputting the months into yearData.
	snowMonths.forEach(function(d, i, arr){
		var temporary = yearData[d];
		if (temporary !== undefined && temporary !== null) {

			//check if there exist month after this.
			var nextStartPoint = yearData[arr[i+1]]
			if(nextStartPoint !== undefined && nextStartPoint !== null){
				const nextMonthDataArray = Object.values(nextStartPoint);
				drawOneMonth(d, temporary, nextMonthDataArray[0]);
			}
			drawOneMonth(d, temporary, null);
		} else {
			console.warn(`Warning: No data available for ${d} in year ${thisYear}.`);
		}
	});
}


function draw(Data){
	Object.entries(Data).forEach(function([year, yearData]) {
		console.log(year, yearData)
		console.log("Test")
		var g = svg.append("g")
				   .attr("transform", `translate(${0},${0})`);
		// Add event listeners to the group
		g.on("mouseover", function() {
			// Fade out all groups except the hovered one
			svg.selectAll("g")
			   .style("opacity", function() {
				   return (this === g.node()) ? 1 : 0.3; // Keep hovered group fully visible
			   });
		})
		.on("mouseout", function() {
			// Restore to half opacity to all groups on mouseout
			svg.selectAll("g")
			   .style("opacity", 0.5);
		});
		svg.append("line")
			.attr("x1", margin)
			.attr("y1", function(){
				return yScale(0);
			})
			.attr("x2", w-margin)
			.attr("y2", function(){
				return yScale(0);
			})
			.attr("stroke", "white");

		makeSnowTempGraph(g, year, yearData)
	})
}
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