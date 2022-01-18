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
    protected sonifierInstance: Sonifier;
    protected isStreamInProgress = false;
    protected current = 0;
    protected sourceId = 1;
    protected data: number[] | undefined;

    constructor(props: DemoSimpleProps) {
        super(props)
        this.sonifierInstance = Sonifier.getSonifierInstance()
        let source = new DataSource(this.sourceId, "SimpleDemo");
        source.addTemplate(new NoteTemplate());
        this.sonifierInstance.addSource(this.sourceId, source);
    }

    public onPause = (data: any) => {
        this.isStreamInProgress = false;
        this.sonifierInstance.onPause();
    }

    public onPlay = (data: any) => {
        this.isStreamInProgress = true;
        this.sonifierInstance.onPlay();
        this.playDataSlowly(data, 200);
    }

    public playDataSlowly(dummyData: number[], speed: number): void {
        console.log("adding calculators")
        this.sonifierInstance.getSource(this.sourceId).addCalculator("max", (datum: Datum, stat: number) => Math.max(...dummyData),0);
        this.sonifierInstance.getSource(this.sourceId).addCalculator("min", (datum: Datum, stat: number) => Math.min(...dummyData),0);
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

    // componentDidMount() is invoked immediately after a component is mounted (inserted into the tree).
    // Initialization that requires DOM nodes should go here. If you need to load data from a remote endpoint,
    // this is a good place to instantiate the network request.
    public componentDidMount() {
        console.log("mounting SimpleDemo")
        let source = new DataSource(this.sourceId, "SimpleDemo");
        source.addTemplate(new NoteTemplate());
        this.sonifierInstance.addSource(this.sourceId, source);
    }

    // componentWillUnmount() is invoked immediately before a component is unmounted and destroyed.
    // Perform any necessary cleanup in this method, such as invalidating timers, canceling network requests,
    // or cleaning up any subscriptions
    public componentWillUnmount() {
        console.log("unmounting DemoSimple")
        this.sonifierInstance.deleteSource(this.sourceId);
    }
}
