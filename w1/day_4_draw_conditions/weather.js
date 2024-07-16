var w = 1200;
var h = 500
var margin = 100


var svg = d3.select("svg")
            .attr("width",w)
            .attr("height",h);

// weather measurements
var weatherData = [
    {
      "Color": "Grey",
      "Sound": ["Water","Traffic"],
      "Object": "Null",
      "Time": 0,
      "Shape": "Christmas tree"
    },
    {
      "Color": "Grey",
      "Sound": ["Knocks_on_metal"],
      "Object": "Birds",
      "Time": 1,
      "Shape": "Potato mash"
    },
    {
      "Color": "Light grey",
      "Sound": ["Water","Metro"],
      "Object": "null",
      "Time": 1,
      "Shape": "Face"
    },
    {
      "Color": "Blinding Light",
      "Sound": ["Talking"],
      "Object": "null",
      "Time": 2,
      "Shape": "Revolver"
    },
    {
      "Color": "Light blue",
      "Sound": ["Steps","talking"],
      "Object": "Birds",
      "Time": 2,
      "Shape": "Null"
    },
    {
      "Color": "Grey",
      "Sound": ["Metro"],
      "Object": "Sun",
      "Time": 3,
      "Shape": "Dog"
    },
    {
      "Color": "White",
      "Sound": ["Steps"],
      "Object": "Sun",
      "Time": 4,
      "Shape": "Funnel"
    },
    {
      "Color": "Grey",
      "Sound": ["Metro", "Keys", "Talking", "Bikes"],
      "Object": "Birds",
      "Time": 4,
      "Shape": "Shadow realm"
    },
    {
      "Color": "Grey",
      "Sound": ["Metro"],
      "Object": "null",
      "Time": 6,
      "Shape": "Cloud that is waving"
    },
    {
      "Color": "Grey",
      "Sound": ["Police", "Talking", "Cars"],
      "Object": "Birds, Insects",
      "Time": 8,
      "Shape": "Lizard, Duck"
    },
    {
      "Color": "White",
      "Sound": ["Metro"],
      "Object": "Birds",
      "Time": 9,
      "Shape": "White spots"
    },
    {
      "Color": "White",
      "Sound": ["Water"],
      "Object": "Bird",
      "Time": 11,
      "Shape": "Dog, Anchor"
    }
  ]
  

// Define a linear gradient for the background (Fra chatgpt)
var defs = svg.append("defs");
var gradient = defs.append("linearGradient")
    .attr("id", "background-gradient")
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "0%")
    .attr("y2", "100%");
gradient.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", "grey");
gradient.append("stop")
    .attr("offset", "50%")
    .attr("stop-color", "lightblue");
gradient.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", "rgb(255,255,150)");

// Append a rectangle filled with the gradient as the background
svg.append("rect")
    .attr("width", w)
    .attr("height", h-33)
    .attr("transform", "translate(75,0)")
    .style("fill", "url(#background-gradient)");

// Create a canvas for circles
var canvas = svg.append("g")
    .attr("transform", "translate(0,0)"); // Adjust as needed



//Scale implementation
var min = d3.min(weatherData, function (d) { return d.Time})
var max = d3.max(weatherData, function (d) { return d.Time})
var xScale = d3.scaleLinear()
                .domain([min, max])
                .range([margin+30, w-margin])

var colors = [
    "Grey",
    "Light grey",
    "Light blue",
    "White",
    "Blinding Light"
]
var yPos = [
    (1/10)*h,
    (2.6/10)*h,
    (4.5/10)*h,
    (5.5/10)*h,
    (9/10)*h
]
var yScale = d3.scaleOrdinal()
                .domain(colors)
                .range(yPos)

var objects = [
    "Birds",
    "Null",
    "Sun",
    "Birds, Insects",
    "Bird",
    "null"
]
var objectColors = [
    "rgb(196, 164, 132)",
    "grey",
    "yellow",
    "rgb(144,238,144)"
]
var objectScale = d3.scaleOrdinal()
                    .domain(objects)
                    .range(objectColors)


var circles = canvas.selectAll("circle")
      .data(weatherData)
      .join("circle")
      .attr("cx", function(d){
            return xScale(d.Time);
        })
      .attr("cy", function (d){
        return yScale(d.Color);
    })
      .attr("r", function(d){
            return d.Sound.length*15;
        }
      )
      .attr("fill", function(d){
        return objectScale(d.Object);
      })

var text = canvas.selectAll("text")
      .data(weatherData)
      .join("text")
      .attr("x", function(d){
        return xScale(d.Time);
        })
      .attr("y",function (d){
        return yScale(d.Color);
    })
      .text(function(d){
          return d.Shape
      })
      .attr("text-anchor", "middle")


// Add x-axis
var xAxis = d3.axisBottom(xScale);
canvas.append("g")
    .attr("transform", `translate(0, ${h - 33})`)
    .call(xAxis);

// Add x-axis label
canvas.append("text")
    .attr("text-anchor", "middle")
    .attr("x", w / 2)
    .attr("y", h - 4)
    .text("Minutes after start");

// Add y-axis
var yAxis = d3.axisLeft(yScale);
canvas.append("g")
    .attr("transform", `translate(75, 0)`)
    .call(yAxis);

// Add y-axis label
canvas.append("text")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .attr("x", -h / 2)
    .attr("y", 20)
    .text("Color");

svg.append("rect")
    .attr("width", 150)
    .attr("height", 120)
    .attr("x", w-150)
    .attr("y", 0)

// Add one dot in the legend for each name.
svg.selectAll("mydots")
  .data(objectColors)
  .enter()
  .append("circle")
    .attr("cx", w-125)
    .attr("cy", function(d,i){ return 40 + i*18}) // 100 is where the first dot appears. 25 is the distance between dots
    .attr("r", 6)
    .style("fill", function(d){ return objectScale(d)})

svg.append("text")
    .attr("x", w-134)
    .attr("y", 21) // 100 is where the first dot appears. 25 is the distance between dots
    .style("fill", "white")
    .text("Objects seen")
    .attr("text-anchor", "left")
    .style("alignment-baseline", "middle")
    .style("font-weight", "bold");
// Add one dot in the legend for each name.
svg.selectAll("mylabels")
  .data(objects.slice(0, objects.length - 2))
  .enter()
  .append("text")
    .attr("x", w-116)
    .attr("y", function(d,i){  return 41 + i*18}) // 100 is where the first dot appears. 25 is the distance between dots
    .style("fill", "white")
    .text(function(d){ return d})
    .attr("text-anchor", "left")
    .style("alignment-baseline", "middle")