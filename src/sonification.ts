//import * as dataflow from "../vega/packages/vega-dataflow";
//import type { Dataflow } from "../vega/packages/vega-dataflow"
//const vega-dataflow = require('../vega/packages/vega-dataflow')
//import "vega/build/"
//import * as vega from "react-vega"
import * as vega from "vega"
// import * as vegaLite from "vega-lite"
import * as vegaEmbed from "vega-embed"
//import * as tone from "tone"
import { exec } from 'child_process';
// import { View } from "vega";
import { AudioContext, OfflineAudioContext } from 'standardized-audio-context';
import { privateEncrypt } from "crypto";

console.log("test")

// let spec : vegaLite.TopLevelSpec =  {
//   $schema: "https://vega.github.io/schema/vega-lite/v2.json",
//   data: {name: "table"},
//   width: 1152,
//   height: 720,
//   autosize: "fit",
//   mark:  {type: "line", interpolate: "monotone"},
//     encoding: {
//         x: { field: 'x', type: 'quantitative', scale: { zero: false} },
//         y: {field: 'y', type: 'quantitative'}}
// }
// the Vega-lite spec from the tutorial:
let rankSpec: vega.Spec = {
    $schema: 'https://vega.github.io/schema/vega/v5.json',
    description:
        'A bar graph showing the scores of the top 5 students. This shows an example of the window transform, for how the top K (5) can be filtered, and also how a rank can be computed for each student.',
    width: 500,
    height: 200,
    padding: 5,
    autosize: 'pad',
    data: [
        {
            name: 'ranks',
            values: [
                { student: 'A', score: 100 },
                { student: 'B', score: 56 },
                { student: 'C', score: 88 },
                { student: 'D', score: 65 },
                { student: 'E', score: 45 },
                { student: 'F', score: 23 },
                { student: 'G', score: 66 },
                { student: 'H', score: 67 },
                { student: 'I', score: 13 },
                { student: 'J', score: 12 },
                { student: 'K', score: 50 },
                { student: 'L', score: 78 },
                { student: 'M', score: 66 },
                { student: 'N', score: 30 },
                { student: 'O', score: 97 },
                { student: 'P', score: 75 },
                { student: 'Q', score: 24 },
                { student: 'R', score: 42 },
                { student: 'S', score: 76 },
                { student: 'T', score: 78 },
                { student: 'U', score: 21 },
                { student: 'V', score: 46 },
            ],
            "transform": [
                {"type": "filter", "expr": "datum.score > 50"}
            ]
        },
    ],
}
    

//const config: vegaLite.Config = { line: { color: 'firebrick' } };
//const vegaSpec = vegaLite.compile(spec, {config}).spec;
//console.log(vegaSpec)
// let vegaSpec = vega.compile(rankSpec); // compiling to vega spec.
var chart = new vega.View(vega.parse(rankSpec), 
    { renderer: 'none' }) // creating the vega.view object. setting renderer as none as we are not interested in viewing the output visualization.
chart.run() // running so that the transforms happen
console.log("set up chart")
console.log(chart.data("ranks")) 
// console.log("charte object:")
// console.log(chart)
/******help****** 
Jen, please help with getting WebAudio in typescript. AudioContext is one of the core components, and uncommenting the line below this comment block will give you an error.
Fixing this could potentially imply that we have WebAudio support. However, there may be type declarations *only** for web audio so that may not solve all our problems.
Here is an example that works:
tutorial: https://itnext.io/building-a-synthesizer-in-typescript-5a85ea17e2f2
Code (we don't need to implement the tutorial)
https://github.com/kenreilly/typescript-synth-demo
*/
const audioCtx = new AudioContext();
const oscillatorNode = audioCtx.createOscillator();
oscillatorNode.connect(audioCtx.destination);
console.log("playing sin wave")
oscillatorNode.start();

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

// chart.addDataListener('table', (name, value) => {
//     console.log("new data");
//     console.log(name, value);
//     value.map((entry: Entry) => {
//         //const synth = new tone.Synth().toDestination();
//         //const now = tone.now()
//         //synth.triggerAttackRelease("C4","C5", now)
//         //process.stdout.write('\x07');
        
//         exec('play -n -c1 synth  ' + entry.y + '  fade q 0.1 0.1 0.1')
//     });
// });

// while (true) {
//     minimumX++;
//     let entries : Entry[] = valueGenerator();
//     var changeSet = vega
//       .changeset()
//       .insert(entries)
//         .remove(function (t: { x: number, y: number }) {
//         return t.x < minimumX;
//       });
//     chart.change('table', changeSet).run();
//     //console.log("new data:")
//     //console.log(entries);
    
//     setTimeout(() => { }, 500);
// }
