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
				.range([h-margin, margin]);


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
					})
					.style("opacity", 0.7);


				console.log("YEES")
				console.log(element)
				//Transparent line in background for Snow
				g.append("line")
					.attr("x1", function(){
						return monthScale(month) + dayScale(index);
					})
					.attr("y1", function(){
						return yScale(element.maxSnowDepth);
					})
					.attr("x2", function(){
						return monthScale(month) + dayScale(index+1);
					})
					.attr("y2", function(){
						return yScale(nextElement.maxSnowDepth);
					})
					.attr("stroke", "transparent")
					.attr("stroke-width", 8);

				//Dotted Snow line
				g.append("line")
					.attr("x1", function(){
						return monthScale(month) + dayScale(index);
					})
					.attr("y1", function(){
						return yScale(element.maxSnowDepth);
					})
					.attr("x2", function(){
						return monthScale(month) + dayScale(index+1);
					})
					.attr("y2", function(){
						return yScale(nextElement.maxSnowDepth);
					})
					.attr("stroke", function(){
						return colorScale(thisYear)
					})
					.attr("stroke-dasharray", "4")
					.style("opacity", 0.7);
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
				   return (this === g.node()) ? 1 : 0.2; // Keep hovered group fully visible
			   });
		})
		.on("mouseout", function() {
			// Restore to half opacity to all groups on mouseout
			svg.selectAll("g")
			   .style("opacity", 0.7);
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
			.attr("stroke", "transparent");

		makeSnowTempGraph(g, year, yearData)
		
		// Define your multi-line text
		var textLines = [
			"Winter",
			`${year}-${(parseInt(year, 10)-1999)}`
		];

		// Append a text element and use tspans to handle multi-line text
		var textElement = g.append("text")
			.attr("x", (year - 2010) * (w / years.length))
			.attr("y", 50)
			.style("stroke", function(){
				return colorScale(year)
			})
			.style("font-size", "20px");

		// Append each line as a separate tspan
		textLines.forEach((line, index) => {
			textElement.append("tspan")
				.attr("x", (year - 2010) * (w / years.length)) // align with the x of the main text element
				.attr("dy", index === 0 ? 0 : "1.2em") // Adjust vertical position for subsequent lines
				.text(line);
		});
	})
}