import React from 'react'

import { TextField } from '@mui/material'
import { IDemoView } from './IDemoView'
import { FilterRangeTemplate } from '../../sonification/templates/FilterRangeTemplate'
import { NoiseSonify } from '../../sonification/displays/NoiseSonify'
import { DemoSimple, DemoSimpleProps, DemoSimpleState } from './DemoSimple'
import { NoteTemplate } from '../../sonification/templates/NoteTemplate'
import { Sonifier } from '../../sonification/Sonifier'
import { DataSource } from '../../sonification/DataSource'
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
     * There can only be one sonifier! But we need a pointer to it
     */
    protected sonifierInstance: Sonifier
    /**
     * Are we streaming data right now?
     */
    protected isStreamInProgress = false
    /**
     * @todo implement pausing
     * The index into our data set that we were at when we were paused
     */
    protected current = 0

    /**
     * Holder for the current data source object
     */
    protected source: DataSource | undefined
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
        // this.state = {
        // minValue: this.props.dataSummary.min,
        // maxValue: this.props.dataSummary.max,
        // }
        this.sonifierInstance = Sonifier.getSonifierInstance()
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
        if (!this.source) this.initializeSource()

        // SONIFICATION
        this.getSource().setStat('max', Math.max(...data))
        this.getSource().setStat('min', Math.min(...data))

        // SONIFICATION INITIALIZATION
        this.sonifierInstance.onPlay()

        this.playDataSlowly(data, 200)
    }
    public onPause = (data: any) => {
        this.isStreamInProgress = false
        this.sonifierInstance.onPause()
    }
    /**
     * Fakes streaming data
     *
     * Loops through the data set calling sonifierInstance.pushPoint(...).
     * Waits speed milliseconds between pushing.
     *
     * @param dummyData The data set being fake-streamed
     * @param speed How many milliseconds to wait between each data point
     */
    public playDataSlowly(dummyData: number[], speed: number): void {
        if (DEBUG)
            console.log(
                `playTone: sonifying data of length ${dummyData.length} starting at ${this.current} at speed ${speed}`,
            )
        this.data = dummyData
        for (let i = this.current; i < dummyData.length; i++) {
            this.current = i
            setTimeout(() => {
                console.log(`streaming ${dummyData[i]}`)
                if (this.isStreamInProgress) {
                    // SONIFICATION
                    this.sonifierInstance.pushPoint(dummyData[i], this.getSource().id)
                }
            }, speed * i)
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

    /**
     * Something was updated in this class.
     * Make sure that we are updating our filter to reflect the new min/max values
     * @param prevProps new min/max value
     */
    public componentDidUpdate(prevProps: ExperimentalDemoHighlightRegionProps) {
        // // When the data summary changes, update the min & max value
        // if (
        //     this.props.dataSummary.min !== prevProps.dataSummary.min ||
        //     this.props.dataSummary.max !== prevProps.dataSummary.max
        // ) {
        //     let minValue = this.props.dataSummary.min,
        //         maxValue = this.props.dataSummary.max
        //     this.setState({ minValue, maxValue })
        // }
        // SONIFICATION
        // if (this.filter) this.filter.range = [this.state.minValue, this.state.maxValue]
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
    }

    ////////// HELPER METHODS ///////////////
    public initializeSource() {
        this.source = this.sonifierInstance.addSource('HighlightRegionDemo')
        /**
         * @todo vpotluri to understand: where is the update datum method for this being called?
         */
        // this.filter =
        this.source.addTemplate(new NoteTemplate(this.source))
        this.source.addTemplate(new FilterRangeTemplate(this.source, new NoiseSonify(), [this.min, this.max]))
        return this.source
    }
}
