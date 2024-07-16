var width = 1250;
var height = 500;
var leftMargin = 100;
var clockSize = 75;
var canvas = d3.select("#vis")
				.append("svg")
				.attr("width",width)
				.attr("height",height);

const dataSound = [
                { hour: 12, minute: 0, label: "lærer snak", sound: "medium" },
                { hour: 12, minute: 0, label: "mouse click", sound: "low" },
                { hour: 12, minute: 2, label: "pen click", sound: "low" },
                { hour: 12, minute: 3, label: "dør smæk", sound: "high" },
                { hour: 12, minute: 40, label: "Mads laver en lyd", sound: "medium" },
                { hour: 15, minute: 59, label: "test lyd", sound: "low" },
                { hour: 18, minute: 45, label: "test lyd 2", sound: "high" }
              ]

//WatchFace
var circles = canvas.selectAll("circle")
                .data(dataSound)
                .join("circle")
                .attr("cx", function(d,i){
                    return leftMargin+(i*(width/dataSound.length));
                })
                .attr("cy",height/2)
                .attr("r", clockSize)
                .attr("fill", function(d){
                    if (d.sound === "low") {
                        return "green"
                    } else if (d.sound === "medium") {
                        return "yellow"
                    } else{
                        return "red"
                    }
                });

//WatchCenter
var circleCenter = canvas.selectAll("circles")
                .data(dataSound)
                .join("circle")
                .attr("cx", function(d,i){
                    return leftMargin+(i*(width/dataSound.length));
                })
                .attr("cy",height/2)
                .attr("r", clockSize/14)
                .attr("fill", "black");

//Kode lånt fra ChatGPT:
//function drawLineAtAngle(svg, x1, y1, length, angle) {
//    const angleRad = angle * (Math.PI / 180); // Convert angle to radians
//    const x2 = x1 + length * Math.cos(angleRad);
//    const y2 = y1 - length * Math.sin(angleRad); // Subtract because SVG y-coordinates increase downwards
//
//    svg.append("line")
//       .attr("x1", x1)
//       .attr("y1", y1)
//       .attr("x2", x2)
//       .attr("y2", y2)
//       .attr("stroke", "black")
//       .attr("stroke-width", 2);
//  }

function getAngleRad(angle){
    return angle * (Math.PI / 180);
}

var hourArm = canvas.selectAll("line")
            .data(dataSound)
            .join("line")
            .attr("x1", function(d,i){
                return leftMargin+(i*(width/dataSound.length));
            })
            .attr("y1", height/2)
            .attr("x2", function(d,i){
                var x1 = leftMargin + (i * (width / dataSound.length));
                var angle = getAngleRad(360 - ((270 + ((d.hour + (d.minute / 60)) * 30)) % 360));
                var armLength = (clockSize*3)/5;
                return x1 + (armLength * Math.cos(angle));
            })
            .attr("y2", function(d,i){
                var y1 = height / 2;
                var angle = getAngleRad(360 - ((270 + ((d.hour + (d.minute / 60)) * 30)) % 360));
                var armLength = (clockSize*3)/5;
                return y1 - (armLength * Math.sin(angle));
            })
            .attr("stroke", "black")
            .attr("stroke-width", clockSize/25);


var minuteArm = canvas.selectAll("minute_line")
            .data(dataSound)
            .join("line")
            .attr("x1", function(d,i){
                return leftMargin+(i*(width/dataSound.length));
            })
            .attr("y1", height/2)
            .attr("x2", function(d,i){
                var x1 = leftMargin + (i * (width / dataSound.length));
                var angle = getAngleRad(360 - ((270 + (d.minute * 6)) % 360));
                var armLength = (clockSize*4)/5;
                return x1 + (armLength * Math.cos(angle));
            })
            .attr("y2", function(d,i){
                var y1 = height / 2;
                var angle = getAngleRad(360 - ((270 + (d.minute * 6)) % 360));
                var armLength = (clockSize*4)/5;
                return y1 - (armLength * Math.sin(angle));
            })
            .attr("stroke", "black")
            .attr("stroke-width", clockSize/33);

var text = canvas.selectAll("text")
            .data(dataSound)
            .join("text")
            .attr("x", function(d,i){
                return leftMargin+(i*(width/dataSound.length));
            })
            .attr("y",height/2 + (clockSize+25))
            .text(function(d){
                return d.label
            })
            .attr("text-anchor", "middle")