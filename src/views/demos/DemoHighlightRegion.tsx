import React from 'react'

import { TextField } from '@mui/material'
import { IDemoView } from './IDemoView'
import { FilterRangeTemplate } from '../../sonification/templates/FilterRangeTemplate';
import { NoiseSonify } from '../../sonification/displays/NoiseSonify';
import { DemoSimple, DemoSimpleProps, DemoSimpleState } from './DemoSimple';
import { NoteTemplate } from '../../sonification/templates/NoteTemplate';

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

    filter: FilterRangeTemplate | undefined;

    constructor(props: DemoHighlightRegionProps) {
        super(props)
        this.state = {
            minValue: this.props.dataSummary.min,
            maxValue: this.props.dataSummary.max,
        }
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

    /**
     * Something was updated in this class.
        * Make sure that we are updating our filter to reflect the new min/max values
     * @param prevProps new min/max value
     */
    public componentDidUpdate(prevProps: DemoHighlightRegionProps) {
        // When the data summary changes, update the min & max value
        if (
            this.props.dataSummary.min !== prevProps.dataSummary.min ||
            this.props.dataSummary.max !== prevProps.dataSummary.max
        ) {
            let minValue = this.props.dataSummary.min,
                maxValue = this.props.dataSummary.max
            this.setState({ minValue, maxValue })
        }
        if (this.filter) this.filter.range = [this.state.minValue, this.state.maxValue];
    }

    /**
     * componentDidMount() is invoked immediately after a component is mounted (inserted into the tree).
     * At this point, we set up a new DataSource with the sonifier and store it. We also set up a new
     * filter template to highlight things inbetween min/max
     */
    public componentDidMount() {
        console.log("mounting DemoHighlightRegion")
        this.source = this.sonifierInstance.addSource("HighlightRegionDemo");
        this.filter = new FilterRangeTemplate(new NoiseSonify(), [this.state.minValue, this.state.maxValue]);
        this.source.addTemplate(new NoteTemplate());
        this.source.addTemplate(this.filter);
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
