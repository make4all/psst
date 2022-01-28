import React from 'react'
import { isEmpty, map, take, timer } from 'rxjs'
import { DataSource } from '../../sonification/DataSource'
import { Datum } from '../../sonification/Datum'
import { Sonifier } from '../../sonification/Sonifier'
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
        this.sonifierInstance = Sonifier.getSonifierInstance()
    }

    /**
     * @todo fix comments and debug
     * @param data Not sure what this is -- someone else wrote ti
     */
    public onPause = (data: any) => {
        this.isStreamInProgress = false
        this.sonifierInstance.onPause()
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

        let id = this.source ? this.source.id : 0
        this.getSource().handleEndStream()
        let source = timer(0, 200).pipe(
            map((val) => new Datum(id, data[val])),
            take(data.length),
        )
        this.getSource().setStream(source)
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
        this.sonifierInstance.deleteSource(this.source)
    }

    ////////// HELPER METHODS ///////////////
    /**
     * This initializes the source, but to work fully, it is important to also
     * assign max and min values when the data set is specified.
     * @returns a source
     */
    public initializeSource() {
        // SONIFICATION
        this.source = this.sonifierInstance.addSource('SimpleDemo')
        this.source.addTemplate(new NoteTemplate())
        // this.source.addTemplate(new FilterRangeTemplate(new NoiseSonify(), [4, 10]))

        return this.source
    }
}
