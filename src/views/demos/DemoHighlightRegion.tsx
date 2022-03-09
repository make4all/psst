import React from 'react'

import { TextField } from '@mui/material'
import { IDemoView } from './IDemoView'
import { FilterRangeHandler } from '../../sonification/handler/FilterRangeHandler'
import { NoiseSonify } from '../../sonification/output/NoiseSonify'
import { DemoSimple, DemoSimpleProps, DemoSimpleState } from './DemoSimple'
import { NoteHandler } from '../../sonification/handler/NoteHandler'
import { OutputEngine } from '../../sonification/OutputEngine'
import { FileOutput } from '../../sonification/output/FileOutput'

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
    filter: FilterRangeHandler | undefined

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
        // SONIFICATION
        if (this.filter) this.filter.domain = [this.state.minValue, this.state.maxValue]
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

    ////////// HELPER METHODS ///////////////
    public initializeSink() {
        this.sink = OutputEngine.getInstance().addSink('HighlightRegionDemo')
        /**
         * @todo vpotluri to understand: where is the update datum method for this being called?
         */
        this.filter = new FilterRangeHandler(new NoiseSonify(undefined, undefined, -1), [
            this.state.minValue,
            this.state.maxValue,
        ])

        this.sink.addDataHandler(this.filter, false)
        this.sink.addDataHandler(new NoteHandler(), false)

        return this.sink
    }
}
