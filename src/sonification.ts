//import * as dataflow from "../vega/packages/vega-dataflow";
//import type { Dataflow } from "../vega/packages/vega-dataflow"
//const vega-dataflow = require('../vega/packages/vega-dataflow')
//import "vega/build/"
//import * as vega from "react-vega"
import * as vega from "vega"
// import * as vegaLite from "vega-lite"
import * as vegaEmbed from "vega-embed"

//import * as tone from "tone"
// import { View } from "vega";

console.log("test2")

export function hello() {
    return "hello world!!!!"
}

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
                { "type": "filter", "expr": "datum.score > 50" }
            ]
        },
    ],
}


//const config: vegaLite.Config = { line: { color: 'firebrick' } };
//const vegaSpec = vegaLite.compile(spec, {config}).spec;
//console.log(vegaSpec)
// let vegaSpec = vega.compile(rankSpec); // compiling to vega spec.
const chart = new vega.View(vega.parse(rankSpec),
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
export function playTone(){
    var audioCtx = new AudioContext(); // works without needing additional libraries. need to check this when we move away from react as it is currently pulling from react-don.d.ts.
    let startTime = audioCtx.currentTime;
    var dummyData = [20, 50, 30, 40, 7, 300,800,400,1000,900,123,20,40,12500];
    var sweepLength = 0.2;
    var previousFrequencyOfset = 200;
    for (let i = 0; i < dummyData.length; i++)
      {
        console.log("in for loop. I = ", i)
        console.log("startTime:",startTime);
        var frequencyOfset = 20 * dummyData[i];
        // frequencyOfset = frequencyOfset%1000;
        // time=audioCtx.currentTime;
        console.log("frequency ofset", frequencyOfset);
        var osc = audioCtx.createOscillator();
        osc.frequency.value = previousFrequencyOfset;
        var endTime = startTime+sweepLength;
        // var loopTime = time*i*sweepLength;
        // console.log("start time ",startTime);
        // const wave = audioCtx.createPeriodicWave(wavetable.real, wavetable.imag);
        // osc.setPeriodicWave(wave);
        // aucilators[i] = osc;
        // osc.frequency.linearRampToValueAtTime(0,previousFrequencyOfset);
        osc.frequency.linearRampToValueAtTime(frequencyOfset,startTime+sweepLength);
        // console.log("time after increasing");
        // console.log(audioCtx.currentTime);
        // console.log(osc.frequency.value);
        // osc.frequency.exponentialRampToValueAtTime(380,startTime+sweepLength);
        // console.log("time after decreasing")
        // console.log(audioCtx.currentTime);
        osc.connect(audioCtx.destination);
        osc.start(startTime)
        // console.log("started");
        osc.stop(endTime);
        // console.log("stopping");
        // console.log(audioCtx.currentTime);
startTime = endTime;
previousFrequencyOfset = frequencyOfset;



        
      }

     

}




