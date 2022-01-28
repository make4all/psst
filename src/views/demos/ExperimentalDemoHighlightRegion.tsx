import React from 'react'

import { TextField } from '@mui/material'
import { IDemoView } from './IDemoView'
import { FilterRangeTemplate } from '../../sonification/templates/FilterRangeTemplate'
import { NoiseSonify } from '../../sonification/displays/NoiseSonify'
import { NoteTemplate } from '../../sonification/templates/NoteTemplate'
import { DataSource } from '../../sonification/DataSource'
import { DisplayBoard } from '../../sonification/displays/DisplayBoard'
import { map, take, timer } from 'rxjs'
import { Datum } from '../../sonification/Datum'

const DEBUG = false

export interface ExperimentalDemoHighlightRegionState {
    // dataSummary: any
}
export interface ExperimentalDemoHighlightRegionProps {
    dataSummary: any
}

// I don't know react well enough -- can this extend demosimple instead? Would be much simpler...
// would still need to get the highlightRegionProps...
// there is a lot of duplication between this and DemoSimple right now...
export class ExperimentalDemoHighlightRegion<ExperimentalDemoHighlightRegionProps, ExperimentalDemoHighlightRegionState>
    extends React.Component<ExperimentalDemoHighlightRegionProps, ExperimentalDemoHighlightRegionState>
    implements IDemoView
{
    /**
     * Are we streaming data right now?
     */
    protected isStreamInProgress = false

    /**
     * There can only be one display board! But we need a pointer to it
     */
    protected displayBoardInstance: DisplayBoard

    /**
     * @todo implement pausing
     * The index into our data set that we were at when we were paused
     */
    protected current = 0

    /**
     * Holder for the current data source object
     */
    protected source: DataSource | undefined

    /**
     * The filter object
     */
    filter: FilterRangeTemplate | undefined

    public getSource(): DataSource {
        if (this.source) return this.source
        else return this.initializeSource()
    }

    /**
     * Holder for data set to sonify
     */
    protected data: number[] | undefined

    /**
     * the minimum number.
     * @todo needs to be changed to become a state variable. defaults to -1 to test if the sign demo works.
     */
    protected min: number

    /**
     * the maximum number.
     * @todo needs to be changed to become a state variable. defaults to 10 to test if the sign demo works.
     */
    protected max: number

    // filter: FilterRangeTemplate | undefined

    /**
     * constructor
     * gets a sonifier.
     * @todo need to handel state better.
     * @param props
     */
    constructor(props: ExperimentalDemoHighlightRegionProps) {
        super(props)

        this.displayBoardInstance = DisplayBoard.getDisplayBoardInstance()
        this.min = -1
        this.max = 10
    }
    /**
     * The play button has been pressed and data set specified. Time to start sonificatino
     *
     * First, since we now know what data we are playing, this adds a max/min calculator
     * to our data source. The calculation is based on the full data set and always returns the
     * same value as a result
     * @todo think about how to set up static calculations so they don't run over and over again.
     *
     * Second, we make a callback to the sonifierInstance to let it know to shift into play mode
     * Third, we call playDataSlowly() to simulate streaming data
     *
     * @param data The data set to be played
     */
    public onPlay = (data: any) => {
        this.isStreamInProgress = true
        if (this.source) this.getSource().handleEndStream()
        else this.initializeSource()

        // SONIFICATION
        this.getSource().setStat('max', Math.max(...data))
        this.getSource().setStat('min', Math.min(...data))

        // SONIFICATION INITIALIZATION
        this.displayBoardInstance.onPlay()

        let id = this.source ? this.source.id : 0
        let source = timer(0, 200).pipe(
            map((val) => new Datum(id, data[val])),
            take(data.length),
        )
        console.log('setStream in demo')
        this.getSource().setStream(source)
    }

    public onPause = (data: any) => {
        this.isStreamInProgress = false
        this.displayBoardInstance.onPause()
    }

    /**
     * Garbage collect our data stream.
     */
    public componentWillUnmount() {
        if (this.source) {
            this.source.handleEndStream()
            this.displayBoardInstance.deleteSource(this.source)
        }
    }

    public render() {
        // const { minValue, maxValue } = this.state

        return (
            <div>
                <TextField
                    id="text-min-value"
                    aria-label="Enter minimum value"
                    label="Min"
                    variant="outlined"
                    type="number"
                    value={isNaN(this.min) ? '' : this.min}
                    onChange={(e) => this._handleValueChange(parseFloat(e.target.value), 'min')}
                />
                <TextField
                    id="text-max-value"
                    aria-label="Enter maximum value"
                    label="Max"
                    variant="outlined"
                    type="number"
                    value={isNaN(this.max) ? '' : this.max}
                    onChange={(e) => this._handleValueChange(parseFloat(e.target.value), 'max')}
                />
            </div>
        )
    }

    private _handleValueChange = (value: number, which: string) => {
        switch (which) {
            case 'min':
                this.min = value
                break
            case 'max':
                this.max = value
                break
        }
        if (this.filter) this.filter.range = [this.min, this.max]
    }

    ////////// HELPER METHODS ///////////////
    public initializeSource() {
        this.source = this.displayBoardInstance.addSource('HighlightRegionDemo')
        /**
         * @todo vpotluri to understand: where is the update datum method for this being called?
         */

        this.source.addTemplate(new NoteTemplate(this.source))
        this.filter = new FilterRangeTemplate(this.source, new NoiseSonify(), [this.min, this.max])
        this.source.addTemplate(this.filter)
        return this.source
    }
}
