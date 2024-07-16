// Select the SVG element
const svg = d3.select("#canvas").select("svg")
    .attr("width", 500)
    .attr("height", 500);

// Define the gradient
const defs = svg.append("defs");

const gradient = defs.append("linearGradient")
    .attr("id", "gradient")
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "100%")
    .attr("y2", "100%");

gradient.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", "grey");

gradient.append("stop")
    .attr("offset", "50%")
    .attr("stop-color", "blue");

gradient.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", "white");

// Add a rectangle with the gradient as the background
svg.append("rect")
    .attr("width", "100%")
    .attr("height", "100%")
    .style("fill", "url(#gradient)");