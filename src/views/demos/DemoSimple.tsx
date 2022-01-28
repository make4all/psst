import React from 'react'
import { DataSource } from '../../sonification/DataSource'
import { Datum } from '../../sonification/Datum'
import { NoiseSonify } from '../../sonification/displays/NoiseSonify'
import { DisplayBoard } from '../../sonification/displays/DisplayBoard'
import { FilterRangeTemplate } from '../../sonification/templates/FilterRangeTemplate'
import { NoteTemplate } from '../../sonification/templates/NoteTemplate'
import { IDemoView } from './IDemoView'

const DEBUG = false

export interface DemoSimpleState {}

export interface DemoSimpleProps {
    dataSummary: any
}

export class DemoSimple<DemoSimpleProps, DemoSimpleState>
    extends React.Component<DemoSimpleProps, DemoSimpleState>
    implements IDemoView
{
    /**
     * There can only be one display board! But we need a pointer to it
     */
    protected displayBoardInstance: DisplayBoard
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
     * Holder for data set to sonify
     */
    protected data: number[] | undefined

    /**
     * Holder for the current data source object
     */
    protected source: DataSource | undefined
    public getSource(): DataSource {
        if (this.source) return this.source
        else return this.initializeSource()
    }
    /**
     * Constructor
     * @param props Normal react props
     */
    constructor(props: DemoSimpleProps) {
        super(props)
        this.displayBoardInstance = DisplayBoard.getDisplayBoardInstance()
    }

    /**
     * @todo fix comments and debug
     * @param data Not sure what this is -- someone else wrote ti
     */
    public onPause = (data: any) => {
        this.isStreamInProgress = false
        this.displayBoardInstance.onPause()
    }

    /**
     * The play button has been pressed and data set specified. Time to start sonificatino
     *
     * First, since we now know what data we are playing, this adds a max/min calculator
     * to our data source. The calculation is based on the full data set and always returns the
     * same value as a result
     * @todo think about how to set up static calculations so they don't run over and over again.
     *
     * Second, we make a callback to the display board instance to let it know to shift into play mode
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
        this.displayBoardInstance.onPlay()

        this.playDataSlowly(data, 200)
    }

    /**
     * Fakes streaming data
     *
     * Loops through the data set calling displayBoardInstance.pushPoint(...).
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
                    this.displayBoardInstance.pushPoint(dummyData[i], this.getSource().id)
                }
            }, speed * i)
        }
        //this.sonifierInstance.onStop();
    }

    public render() {
        return (
            <div>
                <p> press play to hear a simple sonification</p>
            </div>
        )
    }

    /**
     * componentDidMount() is invoked immediately after a component is mounted (inserted into the tree).
     * At this point, we set up a new DataSource and store it
     */
    public componentDidMount() {
        this.initializeSource()
    }

    /**
     * Garbage collect our data stream.
     */
    public componentWillUnmount() {
        this.displayBoardInstance.deleteSource(this.source)
    }

    ////////// HELPER METHODS ///////////////
    /**
     * This initializes the source, but to work fully, it is important to also
     * assign max and min values when the data set is specified.
     * @returns a source
     */
    public initializeSource() {
        // SONIFICATION
        this.source = this.displayBoardInstance.addSource('SimpleDemo')
        this.source.addTemplate(new NoteTemplate())
        this.source.addTemplate(new FilterRangeTemplate(new NoiseSonify(), [4, 10]))

        return this.source
    }
}
