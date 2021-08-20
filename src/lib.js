"use strict";
exports.__esModule = true;
console.log("test");
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
// const config: vegaLite.Config = { line: { color: 'firebrick' } };
// const vegaSpec = vegaLite.compile(spec, {config}).spec;
// console.log(vegaSpec)
// //let div = document.createElement("div");
// let view = new vega.View(vegaSpec, { renderer: 'none' });
// function* chartUpdater() {
//     let y = 0;
//     for (let x = 0; ; x++) {
//         y += Math.random() - 0.5;
//         var changeSet = view.changeset()
//             // This changeset adds a new datapoint
//             .insert({ x, y });
//             // And removes any datapoints from more than 10 ticks ago
//            // .remove(({ x : vegaLite.xValue }) => xValue < x - 50);
//         //view.change('table', changeSet).run();
//         yield new Promise(() => setTimeout(() => {return view }, 100));
//     }
// }
// let iterator = chartUpdater();
// while (true) {
//     console.log("looping")
//     console.log(iterator.next())
// }
