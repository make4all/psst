import './index.css';
import { VegaLite, View } from 'react-vega';
import { VisualizationSpec } from 'vega-embed';
import * as vega from 'vega';
import React, { useState, useEffect, useRef } from 'react';


const sineDataSupplier = (x: number) => {
  const y = 100 / 2 + 40 * Math.sin(x / 2);
  return { x: x, value: Math.floor(y) };
};


export function AreaGraph() {
  const [view, setView] = useState<View>();
  const z = -20;
  const x = 0;

  const ref = useRef({
    x,
    z,
  });
    
  useEffect(() => {
    function updateGraph() {
      const data = sineDataSupplier(ref.current.x);
      ref.current.x++;
      ref.current.z++;

      const cs = vega
        .changeset()
        .insert(data)
        .remove((t: { x: number; value: number }) => {
          return t.x < ref.current.z;
        });
      if (view) {
        view.change('data', cs).run();
      }
    }

    if (view) {
      updateGraph();
      const interval: number = window.setInterval(updateGraph, 1111);
      return () => clearInterval(interval);
    }
  }, [view]);

  const spec: VisualizationSpec = {
    $schema: 'https://vega.github.io/schema/vega-lite/v4.json',
    description: 'Streaming Data',
    height: 200,
    width: 600,
    data: { name: 'data' },
    layer: [
      {
        encoding: {
          x: {
            field: 'x',
            type: 'ordinal',
            axis: {
              title: 'x axis',
            },
          },
          y: {
            field: 'value',
            type: 'quantitative',
            axis: {
              title: 'values',
            },
          },
        },
        layer: [
          {
            mark: {
              type: 'area',
              line: {
                color: 'darkslategray',
              },
              color: {
                x1: 1,
                y1: 1,
                x2: 1,
                y2: 0,
                gradient: 'linear',
                stops: [
                  {
                    offset: 0,
                    color: 'white',
                  },
                  {
                    offset: 1,
                    color: 'darkslategray',
                  },
                ],
              },
            },
          },
          {
            // selection: {
            //   label: {
            //     type: 'single',
            //     nearest: true,
            //     on: 'mouseover',
            //     encodings: ['x'],
            //     empty: 'none',
            //   },
            // },
            mark: { type: 'rule', color: 'gray' },
            encoding: {
              tooltip: [{ field: 'value', title: 'value ', type: 'ordinal' }],
              //opacity: {
               // condition: { selection: 'label', value: 1 },
               // value: 0,
              //},
            },
          },
        ],
      },
    ],
  };

  return (
    <>
      <h3>React Vega Streaming Data</h3>
      <div>
        <VegaLite
          spec={spec}
          actions={false}
          renderer={'svg'}
          onNewView={(view) => setView(view)}
        />
      </div>
    </>
  );
}
export default AreaGraph;