import React from 'react'
import { DataSource } from '../../sonification/DataSource';
import { Datum } from '../../sonification/Datum';
import { Sonifier } from '../../sonification/Sonifier'
import { NoteTemplate } from '../../sonification/templates/NoteTemplate';
import { IDemoView } from './IDemoView'

const DEBUG = false;
 
export interface DemoSimpleState {}

export interface DemoSimpleProps {
    dataSummary: any
}

export class DemoSimple<DemoSimpleProps, DemoSimpleState> extends React.Component<DemoSimpleProps, DemoSimpleState> implements IDemoView {
    /**
     * There can only be one sonifier! But we need a pointer to it
     */
    protected sonifierInstance: Sonifier;
    /**
     * Are we streaming data right now?
     */
    protected isStreamInProgress = false;
    /**
     * @todo implement pausing
     * The index into our data set that we were at when we were paused
     */
    protected current = 0;

    /**
     * Holder for data set to sonify
     */
    protected data: number[] | undefined;

    /**
     * Holder for the current data source object
     */
    protected source: DataSource | undefined;

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
        this.isStreamInProgress = false;
        this.sonifierInstance.onPause();
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
        this.isStreamInProgress = true;
        if (!this.source) {
            this.source = this.sonifierInstance.addSource("DemoSimple");
            console.error("Wierdly, play started without a source")
        }

        this.source.addCalculator("max", (datum: Datum, stat: number) => Math.max(...data), 0);
        this.source.addCalculator("min", (datum: Datum, stat: number) => Math.min(...data), 0);
            
        this.sonifierInstance.onPlay();
        this.playDataSlowly(data, 200);
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
        if (DEBUG) console.log(`playTone: sonifying data of length ${dummyData.length} starting at ${this.current} at speed ${speed}`)
        this.data = dummyData;
        for (let i = this.current; i < dummyData.length; i++) {
            this.current = i;
            setTimeout(() => {
                console.log(`streaming ${dummyData[i]}`)
                if (this.isStreamInProgress) {
                    this.sonifierInstance.pushPoint(dummyData[i], 1)
                }
            },  speed * i)
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
        console.log("mounting SimpleDemo")
        this.source = this.sonifierInstance.addSource("SimpleDemo");
        this.source.addTemplate(new NoteTemplate());
    }

    /**
     * Garbage collect our data stream.
     */
    public componentWillUnmount() {
        console.log("unmounting DemoSimple")
        this.sonifierInstance.deleteSource(this.source);
    }
}
