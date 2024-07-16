//GOAL: can we set up a local coding environment, webpage and draw 1 shape on it?

var width = 1300;
var height = 9550;
var xPos = width/2;
var yPos = height/2;
var rad = 40;


var canvas = d3.select("#myVis")
                .append("svg")
                .attr("width", width)
                .attr("height", height);

function createCircle(canvas, cx, cy, r, fill) {
        return canvas.append("circle")
          .attr("cx", cx)
          .attr("cy", cy)
          .attr("r", r)
          .attr("fill", fill);
      }

function createMoreCircles(xposition, yposition){
        let circle1 = createCircle(canvas, xposition, yposition, rad, "red");
        let circle2 = createCircle(canvas, xposition + 50, yposition, rad, "green");
        let circle3 = createCircle(canvas, xposition + 100, yposition, rad, "blue");
}
for (let inex = 0; inex < width/200; inex++){
        for (let index = 0; index < height/80; index++) {
                createMoreCircles(inex*200, index*80)
        }
}


/*
var shapeFromD3 = canvas.append("rect")
        .attr("x", width - 200)
        .attr("y", height - 200)
        .attr("width", 200)
        .attr("height", 200)
        .attr("fill","red");
        */










































// var w = 500;
// var h = 500;
// var rad = 20;

// var svg = d3.select("svg")
// 			.attr("width",w)
// 			.attr("height",h);

// var circles = d3.selectAll("circle")
// 				.attr("r", rad)
// 				.attr("cx", w/2)
// 				.attr("cy", h/2);