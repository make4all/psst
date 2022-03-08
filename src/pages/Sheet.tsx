import React, { useEffect } from 'react'
import * as d3 from 'd3'
// approach: does not work if not using create-react-app
// import {ReactComponent as ReactLogo} from './letter-portrait.svg';

/**
 * The purpose of this class is to import the blank sheet svg separately, to be imported in another component.
 */

// breaks the rules of hooks (cannot call useEffect inside a component)
function createImage() {
    useEffect(() => {
    d3.xml("letter-portrait.svg")
        .then(data => {
            d3.select("#svg-container").node().append(data.documentElement)
        });
    });
}

export default function MusicSheet() {
    useEffect(() => {

    // making sure that using regular d3 works; it does
    //   const width = 400;
    //   const height = 400;
    //   const data = [10, 28, 35];
    //   const colors = ["green", "lightblue", "yellow"];

    //   const svg = d3
    //     .select("body")
    //     .append("svg")
    //     .attr("width", width)
    //     .attr("height", height);

    //   const g = svg
    //     .selectAll("g")
    //     .data(data)
    //     .enter()
    //     .append("g")
    //     .attr("transform", function (d, i) {
    //       return "translate(0,0)";
    //     });

    //   g.append("circle")
    //     .attr("cx", function (d, i) {
    //       return i * 75 + 50;
    //     })
    //     .attr("cy", function (d, i) {
    //       return 75;
    //     })
    //     .attr("r", function (d) {
    //       return d * 1.5;
    //     })
    //     .attr("fill", function (d, i) {
    //       return colors[i];
    //     });

    //   g.append("text")
    //     .attr("x", function (d, i) {
    //       return i * 75 + 25;
    //     })
    //     .attr("y", 80)
    //     .attr("stroke", "teal")
    //     .attr("font-size", "10px")
    //     .attr("font-family", "sans-serif")
    //     .text((d) => {
    //       return d;
    //     });
    // }, []);
    // approach: still causing the "enable js" issue
      d3.xml("letter-portrait.svg")
          .then(data => {
              d3.select("#svg-container").node().append(data.documentElement)
          });
      });

    return (
      <div className="App">
        <div id="svgcontainer"></div>
      </div>
    );
  }