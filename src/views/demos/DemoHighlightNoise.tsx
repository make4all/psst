import { TextField } from '@mui/material';
import React from 'react';
import { IDemoView } from './IDemoView';

export interface DemoHighlightNoiseState {
    highlightValue: number;
};

export interface DemoHighlightNoiseProps {};

export class DemoHighlightNoise extends React.Component<DemoHighlightNoiseProps, DemoHighlightNoiseState> implements IDemoView {
    constructor(props: DemoHighlightNoiseProps) {
        super(props);
        this.state = {
            highlightValue: 500,
        };
    }
    
    public onPause = (data: any) => {
        
    };

    public onPlay = (data: any) => {

    }

    public render() {
        const { highlightValue } = this.state;
        // TODO: Have the view update value based on data
        // TODO: Create a slider that is in range for the values of the data

        return (
            <div>
                <p> press play to hear a simple sonification</p>
                <TextField
                    id="text-highlight-value"
                    aria-label="Enter highlight value"
                    label="Value"
                    variant="outlined"
                    value={ highlightValue }
                    onChange={ this._handleValueChange }
                    />
            </div>
        );
    }

    // componentDidMount() is invoked immediately after a component is mounted (inserted into the tree).
    // Initialization that requires DOM nodes should go here. If you need to load data from a remote endpoint,
    // this is a good place to instantiate the network request.
    public componentDidMount() {
        
    }

    // componentWillUnmount() is invoked immediately before a component is unmounted and destroyed.
    // Perform any necessary cleanup in this method, such as invalidating timers, canceling network requests,
    // or cleaning up any subscriptions
    public componentWillUnmount() {
        
    }

    private _handleValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {

    }
}
