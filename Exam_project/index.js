// Constants
const w = 1200;
const h = 500;
const margin = 20;
const years = [2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023];
const snowMonths = ["october", "november", "december", "january", "february", "march", "april"];
const endWinter = ["october", "november", "december"];
const monthScale = d3.scaleBand().domain(snowMonths).range([margin, w - margin]);
const yScale = d3.scaleLinear().domain([-20.0, 20.0]).range([h - margin, margin]);
const colorScale = d3.scaleOrdinal().domain(years).range(d3.schemePaired);

// SVG setup
const svg = d3.select("#canvas").append("svg")
  .attr("width", w)
  .attr("height", h)
  .style("background-color", "black");

// Data store
const data = {};

// Parse number utility
const parseNumber = (str) => str ? parseFloat(str.replace(',', '.')) : null;

// Load CSV data functions
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

async function loadSnowCSV(year, month) {
  const filename = `data/${year}_${month}_snow.csv`;
  try {
    return await d3.dsv(';', filename, d => {
      const date = new Date(d["DateTime"]);
      const maxSnowDepth = parseNumber(d["Maks. snedybde"]);
      if (maxSnowDepth !== null) {
        return { date: new Date(date.setHours(0, 0, 0, 0)), maxSnowDepth };
      }
      return null;
    }).then(data => data.filter(d => d !== null));
  } catch (error) {
    console.warn(`Failed to load snow data for ${year} ${month}:`, error);
    return [];
  }
}

// Load and merge data
async function loadAllData() {
  for (const year of years) {
    data[year] = {};
    for (const month of snowMonths) {
      const tempData = endWinter.includes(month)
        ? await loadTempCSV(year, month)
        : await loadTempCSV(year + 1, month);
      const snowData = endWinter.includes(month)
        ? await loadSnowCSV(year, month)
        : await loadSnowCSV(year + 1, month);

      if (tempData && snowData) {
        const combinedData = {};
        tempData.forEach(record => {
          if (record.date) {
            combinedData[record.date.toISOString()] = {
              date: record.date,
              laveste: record.laveste,
              hojeste: record.hojeste,
              middel: record.middel,
              maxSnowDepth: null
            };
          }
        });

        snowData.forEach(record => {
          if (record.date) {
            const dateKey = record.date.toISOString();
            if (combinedData[dateKey]) {
              combinedData[dateKey].maxSnowDepth = record.maxSnowDepth;
            }
          }
        });

        data[year][month] = Object.values(combinedData);
      }
    }
  }
  console.log(data);
  return data;
}

function drawYAxis() {
	// Create a group for the y-axis
	const yAxisGroup = svg.append("g")
	  .attr("class", "y-axis")
	  .attr("transform", `translate(${margin}, 0)`);
  
	// Define the y-axis
	const yAxis = d3.axisLeft(yScale)
	  .ticks(10)
	  .tickSize(-w + 2 * margin); // Extend ticks across the width of the chart
  
	// Append the y-axis to the yAxisGroup
	yAxisGroup.call(yAxis);
  
	// Style the y-axis line
	yAxisGroup.select(".domain")
        .style("stroke", "none"); // Remove the stroke (line) for the axis domain
  
	// Style the tick labels
	yAxisGroup.selectAll(".tick text")
	  .attr("fill", "white") // Color of the tick labels
	  .style("font-family", "Arial, sans-serif")
	  .style("font-size", "12px");
  
	// Add a label for the y-axis
	yAxisGroup.append("text")
	  .attr("class", "y-axis-label")
	  .attr("transform", "rotate(-90)")
	  .attr("y", -margin + 10)
	  .attr("x", -h / 2)
	  .style("text-anchor", "middle")
	  .style("fill", "white") // Color of the y-axis label
	  .style("font-family", "Arial, sans-serif")
	  .style("font-size", "14px")
	  .text("Temperature / Snow Depth");
  }

// Draw graph function
function makeSnowTempGraph(g, thisYear, yearData) {
  function drawOneMonth(month, monthData, nextTempPos) {
    const monthDataArray = Object.values(monthData);

    function dayScale(index) {
      return margin + (index * ((w - (margin * 2)) / snowMonths.length) / monthDataArray.length);
    }

    monthDataArray.forEach((element, index, array) => {
      const nextElement = index < array.length - 1 ? array[index + 1] : nextTempPos;

      if (nextElement !== null) {
        g.append("line")
          .attr("x1", monthScale(month) + dayScale(index))
          .attr("y1", yScale(element.laveste))
          .attr("x2", monthScale(month) + dayScale(index + 1))
          .attr("y2", yScale(nextElement.laveste))
          .attr("stroke", "transparent")
          .attr("stroke-width", 8)
          .attr("class", `temp-line-${thisYear}`);

        g.append("line")
          .attr("x1", monthScale(month) + dayScale(index))
          .attr("y1", yScale(element.laveste))
          .attr("x2", monthScale(month) + dayScale(index + 1))
          .attr("y2", yScale(nextElement.laveste))
          .attr("stroke", colorScale(thisYear))
          .style("opacity", 0.7)
          .attr("class", `temp-line-${thisYear}`);

        g.append("line")
          .attr("x1", monthScale(month) + dayScale(index))
          .attr("y1", yScale(element.maxSnowDepth))
          .attr("x2", monthScale(month) + dayScale(index + 1))
          .attr("y2", yScale(nextElement.maxSnowDepth))
          .attr("stroke", "transparent")
          .attr("stroke-width", 8)
          .attr("class", `snow-line-${thisYear}`);

        g.append("line")
          .attr("x1", monthScale(month) + dayScale(index))
          .attr("y1", yScale(element.maxSnowDepth))
          .attr("x2", monthScale(month) + dayScale(index + 1))
          .attr("y2", yScale(nextElement.maxSnowDepth))
          .attr("stroke", colorScale(thisYear))
          .attr("stroke-dasharray", "4")
          .style("opacity", 0.7)
          .attr("class", `snow-line-${thisYear}`);
      }
    });
  }

  snowMonths.forEach((d, i, arr) => {
    const temporary = yearData[d];
    if (temporary) {
      const nextStartPoint = yearData[arr[i + 1]];
      if (nextStartPoint) {
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
    const textElements = {};
    const visibleGraphs = new Set(); // Set to keep track of visible graphs

    // Add a group for the y-axis (if not already added)
    drawYAxis();

    Object.entries(Data).forEach(function ([year, yearData]) {
        console.log(year, yearData);
        console.log("Test");

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

        svg.append("line")
            .attr("x1", margin)
            .attr("y1", function () {
                return yScale(0);
            })
            .attr("x2", w - margin)
            .attr("y2", function () {
                return yScale(0);
            })
            .attr("stroke", "transparent");

        makeSnowTempGraph(g, year, yearData);

        const textLines = [
            "Winter",
            `${year}-${parseInt(year, 10) - 1999}`
        ];

        const textElement = svg.append("text")
            .attr("x", (year - 2010) * (w / years.length))
            .attr("y", 30)
            .attr("class", `text-element text-element-${year}`)
            .style("fill", colorScale(year))
            .style("text-anchor", "middle")
            .style("font-size", "20px")
            .style("font-family", "Arial, sans-serif")
            .style("cursor", "pointer");

        textLines.forEach((line, index) => {
            textElement.append("tspan")
                .attr("x", margin * 2 + (year - 2010) * (w / years.length))
                .attr("dy", index === 0 ? 0 : "1.2em")
                .text(line)
                .style("font-family", "Arial, sans-serif")
                .style("text-anchor", "middle");
        });

        textElements[year] = textElement;

        textElement.on("click", function () {
            if (visibleGraphs.has(year)) {
                visibleGraphs.delete(year);
                graphGroups[year].style("display", "none");
            } else {
                visibleGraphs.add(year);
                graphGroups[year].style("display", "block");
            }

            Object.entries(textElements).forEach(([textYear, textElem]) => {
                textElem.style("opacity", visibleGraphs.has(textYear) ? 1 : 0.3);
            });

            svg.selectAll(".graph-group").each(function () {
                const currentYear = d3.select(this).attr("class").split("-").pop();
                d3.select(this).style("display", visibleGraphs.has(currentYear) ? "block" : "none");
            });

            if (visibleGraphs.size === 0) {
                svg.selectAll(".graph-group").style("display", "block");
                Object.entries(textElements).forEach(([textYear, textElem]) => {
                    textElem.style("opacity", 1);
                });
            }
        });
    });
}

// Load data and draw the graph
loadAllData().then(function (loadedData) {
  draw(loadedData);
});
