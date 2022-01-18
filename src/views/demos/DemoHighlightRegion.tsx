import React from 'react'

import { TextField } from '@mui/material'
import { IDemoView } from './IDemoView'
import { FilterRangeTemplate } from '../../sonification/templates/FilterRangeTemplate';
import { NoiseSonify } from '../../sonification/displays/NoiseSonify';
import { DemoSimple, DemoSimpleProps, DemoSimpleState } from './DemoSimple';
import { use } from 'chai';
import { DataSource } from '../../sonification/DataSource';

export interface DemoHighlightRegionState extends DemoSimpleState {
    minValue: number
    maxValue: number
}

export interface DemoHighlightRegionProps extends DemoSimpleProps {
    dataSummary: any
}

// I don't know react well enough -- can this extend demosimple instead? Would be much simpler...
// would still need to get the highlightRegionProps...
// there is a lot of duplication between this and DemoSimple right now...
export class DemoHighlightRegion
    extends DemoSimple<DemoHighlightRegionProps, DemoHighlightRegionState>
    implements IDemoView
{
    //noiseTemplate: FilterRangeTemplate;

    constructor(props: DemoHighlightRegionProps) {
        super(props)
        this.state = {
            minValue: this.props.dataSummary.min,
            maxValue: this.props.dataSummary.max,
        }
        this.sourceId = 10
        //this.noiseTemplate = new FilterRangeTemplate(new NoiseSonify(), [this.state.minValue, this.state.maxValue]);
    }

    public render() {
        const { minValue, maxValue } = this.state

        return (
            <div>
                <TextField
                    id="text-min-value"
                    aria-label="Enter minimum value"
                    label="Min"
                    variant="outlined"
                    type="number"
                    value={isNaN(minValue) ? '' : minValue}
                    onChange={(e) => this._handleValueChange(parseFloat(e.target.value), 'min')}
                />
                <TextField
                    id="text-max-value"
                    aria-label="Enter maximum value"
                    label="Max"
                    variant="outlined"
                    type="number"
                    value={isNaN(maxValue) ? '' : maxValue}
                    onChange={(e) => this._handleValueChange(parseFloat(e.target.value), 'max')}
                />
            </div>
        )
    }

    public componentDidUpdate(prevProps: DemoHighlightRegionProps) {
        // When the data summary changes, update the min & max value
        if (
            this.props.dataSummary.min !== prevProps.dataSummary.min ||
            this.props.dataSummary.max !== prevProps.dataSummary.max
        ) {
            let minValue = this.props.dataSummary.min,
                maxValue = this.props.dataSummary.max
            this.setState({ minValue, maxValue })
            //this.noiseTemplate.range = [minValue, maxValue];
        }
    }

    // componentDidMount() is invoked immediately after a component is mounted (inserted into the tree).
    // Initialization that requires DOM nodes should go here. If you need to load data from a remote endpoint,
    // this is a good place to instantiate the network request.
    public componentDidMount() {
        console.log("mounting DemoHighlightRegion")
        let source = new DataSource(this.sourceId, "DemoHighlightRegionSource");
        //source.addTemplate(this.noiseTemplate);
        //this.sonifierInstance.addSource(this.sourceId, source);
    }

    // componentWillUnmount() is invoked immediately before a component is unmounted and destroyed.
    // Perform any necessary cleanup in this method, such as invalidating timers, canceling network requests,
    // or cleaning up any subscriptions
    public componentWillUnmount() {
        console.log("unmounting SimpleHighlightRegion")
        this.sonifierInstance.deleteSource(this.sourceId);
    }

    private _handleValueChange = (value: number, which: string) => {
        switch (which) {
            case 'min':
                this.setState({ minValue: value })
                break
            case 'max':
                this.setState({ maxValue: value })
                break
        }
    }
}
