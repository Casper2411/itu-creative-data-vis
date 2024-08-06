const w = 1200;
const h = 500;
const baseLine = h/2;
const margin = 20;
const years = [2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023]; // List of years
const months = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"]; // List of months
const snowMonths = ["october", "november", "december", "january", "february", "march", "april"]

//Poistioning on y axis
const yScale = d3.scaleLinear()
  				.domain([-20.0,20.0])
				.range([h-margin, margin]);
//Poistioning on xScale is done later

//Here the size of each month is approximately ((w-margin)-margin)/snowMonths.length
var monthScale = d3.scaleBand()
					.domain(snowMonths)
					.range([margin, w-margin]);
var colorScale = d3.scaleOrdinal().domain([0, years.length])
					.range(d3.schemePaired);

var svg = d3.select("#canvas").append("svg")
			.attr("width",w)
			.attr("height",h)
			.style("background-color","black")

//Here all data will be stored:
const data = {};

const parseNumber = (str) => str ? parseFloat(str.replace(',', '.')) : null;

// Function to load and parse temperature CSV data
async function loadTempCSV(year, month) {
	const filename = `data/${year}_${month}_temp.csv`;
	try {
		return await d3.dsv(';', filename, d => ({
		date: new Date(d["DateTime"]),
		laveste: parseNumber(d["Laveste"]),
		hojeste: parseNumber(d["Højeste"]),
		middel: parseNumber(d["Middel"])
		}));
	} catch (error) {
		console.warn(`Failed to load temperature data for ${year} ${month}:`, error);
		return null;
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

		const tempData = endWinter.includes(month) ? await loadTempCSV(year, month) : await loadTempCSV(year + 1, month);
		const snowData = endWinter.includes(month) ? await loadSnowCSV(year, month) : await loadSnowCSV(year + 1, month);
		
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
	return data;
}

function drawYAxis() {
	// Creating a new group for the y-axis
	const yAxisGroup = svg.append("g")
						.attr("class", "y-axis")
						.attr("transform", `translate(${margin*2}, 0)`);
  
	const yAxis = d3.axisLeft(yScale)
					.ticks(10)
					.tickSize(0); // Extend ticks across the width of the chart
  
	// Append the y-axis to the yAxisGroup
	yAxisGroup.call(yAxis);
  
	yAxisGroup.select(".domain")
    .attr("stroke", "white") // Color of the axis line
    .attr("stroke-width", 1); // stroke (line) for the axis domain removed, due to me not knowing if it looks good
  
	yAxisGroup.selectAll(".tick text")
	  .attr("fill", "white") 
	  .style("font-family", "Arial, sans-serif")
	  .style("font-size", "12px");
  
	// label for the y-axis
	yAxisGroup.append("text")
	  .attr("class", "y-axis-label")
	  .attr("transform", "rotate(-90)")
	  .attr("y", -margin*1.75 + 10)
	  .attr("x", -h / 2)
	  .style("text-anchor", "middle")
	  .style("fill", "white")
	  .style("font-family", "Arial, sans-serif")
	  .style("font-size", "14px")
	  .text("Temperature(C°) / Snow Depth(cm)");
}

function drawXAxis() {
    // Creating a new group for the x-axis
    const xAxisGroup = svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(${margin}, ${h - margin*2.25})`); // Position x-axis at the bottom
  
    const xAxis = d3.axisBottom(monthScale)
        .tickSize(0) // Hide the tick lines
        .tickPadding(10); // Space between ticks and labels

  
    // Append the x-axis to the xAxisGroup
    xAxisGroup.call(xAxis);
  
    xAxisGroup.select(".domain")
        .attr("stroke", "white") // Color of the axis line
        .attr("stroke-width", 1); // Width of the axis line
  
    xAxisGroup.selectAll(".tick text")
        .attr("fill", "white") 
        .style("font-family", "Arial, sans-serif")
        .style("font-size", "12px");
  
    // Optional: Add a label for the x-axis
    xAxisGroup.append("text")
        .attr("class", "x-axis-label")
        .attr("x", w / 2)
        .attr("y", margin*2)
        .style("text-anchor", "middle")
        .style("fill", "white")
        .style("font-family", "Arial, sans-serif")
        .style("font-size", "14px")
        .text("Month");
}

//Drawing the graph
function makeSnowTempGraph(g, thisYear, yearData){
	function drawOneMonth(month, monthData, nextPos){

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
				nextElement = nextPos;
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
					.attr("stroke-width", 8)
					.attr("class", `temp-line-${thisYear}`);
				
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
					.style("opacity", 0.7)
					.attr("class", `temp-line-${thisYear}`);

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
					.attr("stroke-width", 8)
					.attr("class", `snow-line-${thisYear}`);

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
					.style("opacity", 0.7)
					.attr("class", `snow-line-${thisYear}`);
			}
		});
	}

	//Here snowMonths is used for inputting the months into yearData.
	snowMonths.forEach(function(d, i, arr){
		const temporary = yearData[d];
		if (temporary !== undefined && temporary !== null) {

			//check if there exist month after this.
			const nextStartPoint = yearData[arr[i+1]]
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


function draw(Data) {
    const graphGroups = {}; // Object to keep track of graph groups for each year
    const textElements = {}; // Object to keep track of the text
    const visibleGraphs = new Set(); // Set to keep track of visible graphs

	drawYAxis();
	drawXAxis();

    Object.entries(Data).forEach(function ([year, yearData]) {
        // Create a group for each year's graph
        var g = svg.append("g")
            .attr("transform", `translate(${0},${0})`)
            .attr("class", `graph-group graph-group-${year}`); // Add a common class for all graph groups

        // Initialize graph visibility to hidden
        graphGroups[year] = g;
        g.style("display", "block");

        // Add event listeners to the group
        g.on("mouseover", function () {
            // Fade out all groups except the hovered one
            svg.selectAll(".graph-group")
                .style("opacity", function () {
                    return (this === g.node()) ? 1 : 0.2; // Keep hovered group fully visible
                });
        })
        .on("mouseout", function () {
            // Restore full opacity to all groups on mouseout
            svg.selectAll(".graph-group")
                .style("opacity", 1);
        });

        makeSnowTempGraph(g, year, yearData);

        // Define your multi-line text
        var textLines = [
            "Winter",
            `${year}-${(parseInt(year, 10) - 1999)}`
        ];

        // Text for each year, 
        const textElement = svg.append("text")
            .attr("x", (year - 2010) * (w / years.length))
            .attr("y", 40)
            .attr("class", "text-element") // Add a class for identifying the text element
            .style("fill", function () {
                return colorScale(year);
            })
            .style("text-anchor", "middle")
            .style("font-size", "20px")
            .style("font-family", "Arial, sans-serif")
            .style("cursor", "pointer"); // Change mouse to look "clickable"

        // Append each line as a separate tspan
        textLines.forEach((line, index) => {
            textElement.append("tspan")
                .attr("x", margin * 2 + (year - 2010) * (w / years.length)) // align with the x of the main text element
                .attr("dy", index === 0 ? 0 : "1.1em") // Here the distance between lines are adjusted
                .text(line)
                .style("font-family", "Arial, sans-serif")
                .style("text-anchor", "middle");
        });

        // Store the text element for this year
        textElements[year] = textElement;

        // Add click handler to the text element
        textElement.on("click", function () {
            // Toggle visibility of the clicked graph and update visibleGraphs set
            if (visibleGraphs.has(year)) {
                // If the year is already visible, remove it from the set and hide the graph
                visibleGraphs.delete(year);
                graphGroups[year].style("display", "none");
            } else {
                // If the year is not visible, add it to the set and show the graph
                visibleGraphs.add(year);
                graphGroups[year].style("display", "block");
            }

            updateGraphics();

            // Show every graph if visibleGraphs are empty, aka nothing to highlight
            if (visibleGraphs.size === 0) {
				//show all graphs
                svg.selectAll(".graph-group").style("display", "block");

                // Show all text
                Object.entries(textElements).forEach(([textYear, textElem]) => {
                    textElem.style("opacity", 1);
                });

            }
        });
    });
	function updateGraphics(){
		Object.entries(textElements).forEach(([textYear, textElem]) => {
			if (!visibleGraphs.has(textYear)) {
				textElem.style("opacity", 0.3); // Hide text if its year is not in visibleGraphs
			} else {
				textElem.style("opacity", 1); // Show text if its year is in visibleGraphs
			}
		});

		svg.selectAll(".graph-group").each(function () {
			const currentYear = d3.select(this).attr("class").split("-").pop(); //Hacky soloution to get the year from the class name, defined upon its initiation
			if (!visibleGraphs.has(currentYear)) {
				d3.select(this).style("display", "none");
			}else{
				d3.select(this).style("display", "block");
			}
		});
	}
	svg.append("text")
				.text("Years with most and least amount of snow")
				.attr("x", w-300)
				.attr("y", h-64)
				.style("fill", "CornflowerBlue")
				.style("text-decoration", "underline")
				.style("cursor", "pointer") // Change cursor to pointer
				.on("click", function () {
					visibleGraphs.clear();
					visibleGraphs.add("2012");//Least amount of snow.
					visibleGraphs.add("2019");//Most amount of snow.

					updateGraphics();
				});
	svg.append("text")
				.text("Most amount of snow measured on a day")
				.attr("x", w-300)
				.attr("y", h-84)
				.style("fill", "CornflowerBlue")
				.style("text-decoration", "underline")
				.style("cursor", "pointer") // Change cursor to pointer
				.on("click", function () {
					visibleGraphs.clear();
					visibleGraphs.add("2015");

					updateGraphics();
				});
	svg.append("text")
				.text("Lowest temperature measured on a day")
				.attr("x", w-300)
				.attr("y", h-104)
				.style("fill", "CornflowerBlue")
				.style("text-decoration", "underline")
				.style("cursor", "pointer") // Change cursor to pointer
				.on("click", function () {
					visibleGraphs.clear();
					visibleGraphs.add("2011");

					updateGraphics();
				});
}

// Load the data
loadAllData().then(function(loadedData) {
    // Now data is fully loaded, and ready for drawing, by the draw function
    draw(loadedData);
});