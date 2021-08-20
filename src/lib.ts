//import * as dataflow from "../vega/packages/vega-dataflow";
//import type { Dataflow } from "../vega/packages/vega-dataflow"
//const vega-dataflow = require('../vega/packages/vega-dataflow')
//import "vega/build/"
//import * as vega from "react-vega"
import * as vega from "vega"
import * as vegaLite from "vega-lite"
import * as vegaEmbed from "vega-embed"

console.log("test")

let spec : vegaLite.TopLevelSpec =  {
  $schema: "https://vega.github.io/schema/vega-lite/v2.json",
  data: {name: "table"},
  width: 1152,
  height: 720,
  autosize: "fit",
  mark:  {type: "line", interpolate: "monotone"},
    encoding: {
        x: { field: 'x', type: 'quantitative', scale: { zero: false} },
        y: {field: 'y', type: 'quantitative'}}
}

//const config: vegaLite.Config = { line: { color: 'firebrick' } };
//const vegaSpec = vegaLite.compile(spec, {config}).spec;
//console.log(vegaSpec)
let vegaSpec = vegaLite.compile(spec);
var chart = new vega.View(vega.parse(vegaSpec.spec), 
    { renderer: 'none' })

console.log("set up chart")

function* chartUpdater() {
    let y = 0;
    for (let x = 0; ; x++) {
        y += Math.random() - 0.5;
        var changeSet = chart.changeset()
            // This changeset adds a new datapoint
            .insert({ x, y });
            // And removes any datapoints from more than 10 ticks ago
           // .remove(({ x : vegaLite.xValue }) => xValue < x - 50);
        chart.change('table', changeSet).run();
        yield new Promise(() => setTimeout(() => {return chart }, 100));
    }
}

let iterator = chartUpdater();
while (true) {
    console.log("looping")
    console.log(iterator.next())
}
