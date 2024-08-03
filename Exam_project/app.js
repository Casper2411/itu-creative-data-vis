var width = 1000;
var height = 500;


var svg = d3.select("#canvas").append("svg")
			.attr("width",width)
			.attr("height",height)
			.style("background-color","white")

// Sample data
const data = [
    { x: 0, y1: 30, y2: 10 },
    { x: 1, y1: 50, y2: 20 },
    { x: 2, y1: 80, y2: 40 },
    { x: 3, y1: 70, y2: 60 },
    { x: 4, y1: 50, y2: 80 },
    { x: 5, y1: 30, y2: 70 }
];

const xScale = d3.scaleLinear()
    .domain(d3.extent(data, d => d.x))
    .range([0, width]);

const yScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => Math.max(d.y1, d.y2))])
    .range([height, 0]);

const line1 = d3.line()
    .x(d => xScale(d.x))
    .y(d => yScale(d.y1));

const line2 = d3.line()
    .x(d => xScale(d.x))
    .y(d => yScale(d.y2));

// Function to compute segments with color change
const computeAreaSegments = (data) => {
    const segments = [];
    for (let i = 0; i < data.length - 1; i++) {
        const d0 = data[i];
        const d1 = data[i + 1];

        // Determine color for the segments
        const color0 = d0.y1 > d0.y2 ? 'red' : 'blue';
        const color1 = d1.y1 > d1.y2 ? 'red' : 'blue';

        // Only add a new segment if color changes
        if (color0 !== color1) {
            segments.push({
                x0: xScale(d0.x),
                x1: xScale(d1.x),
                y0_0: yScale(Math.min(d0.y1, d0.y2)),
                y0_1: yScale(Math.max(d0.y1, d0.y2)),
                y1_0: yScale(Math.min(d1.y1, d1.y2)),
                y1_1: yScale(Math.max(d1.y1, d1.y2)),
                color: color0
            });
            segments.push({
                x0: xScale(d1.x),
                x1: xScale(d1.x),
                y0_0: yScale(Math.min(d1.y1, d1.y2)),
                y0_1: yScale(Math.max(d1.y1, d1.y2)),
                y1_0: yScale(Math.min(d1.y1, d1.y2)),
                y1_1: yScale(Math.max(d1.y1, d1.y2)),
                color: color1
            });
        } else {
            segments.push({
                x0: xScale(d0.x),
                x1: xScale(d1.x),
                y0_0: yScale(Math.min(d0.y1, d0.y2)),
                y0_1: yScale(Math.max(d0.y1, d0.y2)),
                y1_0: yScale(Math.min(d1.y1, d1.y2)),
                y1_1: yScale(Math.max(d1.y1, d1.y2)),
                color: color0
            });
        }
    }
    return segments;
};

const areaGenerator = d3.area()
    .x(d => d.x)
    .y0(d => d.y0)
    .y1(d => d.y1);

// Compute the segments for area paths
const segments = computeAreaSegments(data);

// Create and append area paths
svg.selectAll(".area")
    .data(segments)
    .enter().append("path")
    .attr("class", "area")
    .attr("d", d => {
        return areaGenerator([
            { x: d.x0, y0: d.y0_0, y1: d.y1_0 },
            { x: d.x1, y0: d.y0_1, y1: d.y1_1 }
        ]);
    })
    .style("fill", d => d.color)
    .style("stroke", "none");

// Append the lines
svg.append("path")
    .data([data])
    .attr("class", "line")
    .attr("d", line1)
    .style("stroke", "black");

svg.append("path")
    .data([data])
    .attr("class", "line")
    .attr("d", line2)
    .style("stroke", "black");