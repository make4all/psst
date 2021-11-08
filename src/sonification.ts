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
    return "please enter comma separated numeric values in the editor and press play. Please note that we currently do not have error checking and handeling for invalid inputs so please make sure to enter comma separated numbers only."
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

 

// console.log(chart)
/******resolved****** 
WebAudio now seems to work as it is being picked up from the type definitions of react.dom.ts. We will need to make sure we don't break this when we move away from react eventually.
Here is an example of WebAudio without react that is supposed to work, but didn't for me:
tutorial: https://itnext.io/building-a-synthesizer-in-typescript-5a85ea17e2f2
Code (we don't need to implement the tutorial)
https://github.com/kenreilly/typescript-synth-demo. We used a third-party library, refer to code in jen-audio branch if we need to in the future.
*/

//function that takes an array of numbers and sonifies them. This will evolve as we keep implementing more sonification features.
export function playTone(dummyData:number[]){
    console.log("playTone: sonifying data", dummyData)
    const audioCtx = new AudioContext(); // works without needing additional libraries. need to check this when we move away from react as it is currently pulling from react-dom.d.ts.
    let startTime = audioCtx.currentTime;
    
    let pointSonificationLength:number = 0.3;
    var previousFrequencyOfset = 50;
    for (let i = 0; i < dummyData.length; i++)
      {
        
        var frequencyOfset = 2* dummyData[i];
        // frequencyOfset = frequencyOfset%1000;
        
        console.log("frequency ofset", frequencyOfset);
        var osc = audioCtx.createOscillator();
        osc.frequency.value = previousFrequencyOfset;
        var endTime = startTime+pointSonificationLength;
        // console.log("start time ",startTime);
        // const wave = audioCtx.createPeriodicWave(wavetable.real, wavetable.imag); //keeping this line for future reference if we wish to use custom wavetables.
        // osc.setPeriodicWave(wave);
        osc.frequency.linearRampToValueAtTime(frequencyOfset,startTime+pointSonificationLength);
        // console.log(osc.frequency.value);
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




