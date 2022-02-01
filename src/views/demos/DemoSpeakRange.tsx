import React from 'react'

import { TextField } from '@mui/material'
import { IDemoView } from './IDemoView'
import { FilterRangeTemplate } from '../../sonification/templates/FilterRangeTemplate'
import { Speech } from '../../sonification/displays/Speech'
import { DemoSimple, DemoSimpleProps, DemoSimpleState } from './DemoSimple'
import { NoteTemplate } from '../../sonification/templates/NoteTemplate'

export interface DemoSpeakRangeState extends DemoSimpleState {
    minValue: number
    maxValue: number
}
export interface DemoSpeakRangeProps extends DemoSimpleProps {
    dataSummary: any
}

export class DemoSpeakRange
    extends DemoSimple<DemoSpeakRangeProps, DemoSpeakRangeState>
    implements IDemoView
{
    filter: FilterRangeTemplate | undefined

    constructor(props: DemoSpeakRangeProps) {
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
     * @param prevProps new min/max value
     */
    public componentDidUpdate(prevProps: DemoSpeakRangeProps) {
        // When the data summary changes, update the min & max value
        if (
            this.props.dataSummary.min !== prevProps.dataSummary.min ||
            this.props.dataSummary.max !== prevProps.dataSummary.max
        ) {
            let minValue = this.props.dataSummary.min,
                maxValue = this.props.dataSummary.max
            this.setState({ minValue, maxValue })
        }
        if (this.filter) this.filter.range = [this.state.minValue, this.state.maxValue]
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
    public initializeSource() {
        this.source = this.displayBoardInstance.addSource('SpeakRangeDemo')
        this.filter = new FilterRangeTemplate(this.source, new Speech(), [
            this.state.minValue,
            this.state.maxValue,
        ])
        this.source.addTemplate(new NoteTemplate(this.source))
        this.source.addTemplate(this.filter)
        return this.source
    }
}
