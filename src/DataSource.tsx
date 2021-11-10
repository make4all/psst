import React from 'react';
import Container from 'react-bootstrap/Container'
import { Vega, createClassFromSpec, VisualizationSpec } from "react-vega";
import { action } from '@storybook/addon-actions';
import {PlainObject} from 'react-vega'

type State = {
  data:  PlainObject;
  key: string;
  name: string;
  spec: any;
};

export default class DataSource extends React.PureComponent<{}, State> {
    constructor(key: string, name: string, data: PlainObject) {
        super({})
        this.state = {
            key: key,
            name: name,
            data: data,
            spec: _spec
        }

  }
    

    // updated the dataa
    public setData(data: { x: number; y: number; c: number; }[]) {
        action('update data')(data);
    }

    public getData() {
        return this.state.data;
    }

    public showData() {
        const { key, name, data, spec } = this.state;
        return (
            <div key={key}>
            <div>{name}</div>
            <Vega data={data} spec={spec}  />
            </div>
        )
    }

}

 const  _spec =   {
      'width': 400,
      'height': 400,
      'padding': { 'top': 10, 'left': 50, 'bottom': 50, right: 10 },
      'data': [{ 'name': 'points' }],
      'scales': [
        {
          'name': 'x',
          'type': 'linear',
          'domain': { 'data': 'points', 'field': 'distance' },
          'range': 'width'
        },
        {
          'name': 'y',
          'type': 'linear',
          'domain': { 'data': 'points', 'field': 'value' },
          'range': 'height',
          'nice': true
        }
      ],
      'axes': [
        {
          'type': 'x',
          'scale': 'x',
          'offset': 5,
          'ticks': 5,
          'title': 'Distance',
          'layer': 'back'
        },
        {
          'type': 'y',
          'scale': 'y',
          'offset': 5,
          'ticks': 5,
          'title': 'Value',
          'layer': 'back'
        }
      ],
      'marks': [
        {
          'type': 'line',
          'from': { 'data': 'points' },
          'properties': {
            'enter': {
              'x': { 'scale': 'x', 'field': 'distance' },
              'y': { 'scale': 'y', 'field': 'value' },
              'stroke': { 'value': '#5357a1' },
              'strokeWidth': { 'value': 2 }
            }
          }
        }
      ]
    };
  

