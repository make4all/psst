//import * as dataflow from "../vega/packages/vega-dataflow";
//import type { Dataflow } from "../vega/packages/vega-dataflow"
//const vega-dataflow = require('../vega/packages/vega-dataflow')
//import "vega/build/"
//import * as vega from "react-vega"
import * as vega from "vega"
import * as vegaLite from "vega-lite"
import * as vegaEmbed from "vega-embed"
//import * as tone from "tone"
import { exec } from 'child_process';
import { View } from "vega";

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
//console.log(chart)

class Entry {
    constructor(public x: number, public y: number) { }
}
//const synth = new tone.Synth().toDestination();

function newGenerator() {
    var counter = -1;
    var previousY = [5, 5, 5, 5];
    return function () {
        counter++;
        var newVals = previousY.map(function (v, c) {
            return new Entry(counter, v + Math.round(Math.random() * 10 - c * 3));
        });
        previousY = newVals.map(function (v) {
            return v.y;
        });
        return newVals;
    };
}
  
var valueGenerator = newGenerator();
var minimumX = -100;

chart.addDataListener('table', (name, value) => {
    console.log("new data");
    console.log(name, value);
    value.map((entry: Entry) => {
        //const synth = new tone.Synth().toDestination();
        //const now = tone.now()
        //synth.triggerAttackRelease("C4","C5", now)
        //process.stdout.write('\x07');
        
        exec('play -n -c1 synth  ' + entry.y + '  fade q 0.1 0.1 0.1')
    });
});

while (true) {
    minimumX++;
    let entries : Entry[] = valueGenerator();
    var changeSet = vega
      .changeset()
      .insert(entries)
        .remove(function (t: { x: number, y: number }) {
        return t.x < minimumX;
      });
    chart.change('table', changeSet).run();
    //console.log("new data:")
    //console.log(entries);
    
    setTimeout(() => { }, 500);
}
