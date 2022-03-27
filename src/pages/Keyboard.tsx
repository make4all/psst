import React, {useState} from 'react'
import { NoteSonify } from '../sonification/output/NoteSonify'
import { SimpleDataHandler } from '../sonification/handler/SimpleDataHandler'
import '../styles/keyboard.css'
import { getKeyFreq, OutputStateChange } from '../sonification/OutputConstants'
import { DataSink } from '../sonification/DataSink'
import { filter, Observable, OperatorFunction, pipe, Subject, UnaryFunction } from 'rxjs'
import { Datum } from '../sonification/Datum'
import { OutputEngine } from '../sonification/OutputEngine'

export interface KeyboardProps {}

export interface KeyboardState {
    musicHandler: SimpleDataHandler
    keyFrequencies : Map<String, number>
}


export class Keyboard extends React.Component<KeyboardProps, KeyboardState> {

    private streaming : boolean
    private xSink : DataSink | undefined
    private xAxisStream : Subject<Datum> | undefined

    constructor(props : KeyboardProps) {
        super(props)
        this.state = {
            musicHandler : new SimpleDataHandler(new NoteSonify()),
            keyFrequencies : getKeyFreq()
        }
        this.streaming = false
    }

    filterNullish<T>(): UnaryFunction<Observable<T | null | undefined>, Observable<T>> {
        return pipe(filter((x) => x != null) as OperatorFunction<T | null | undefined, T>)
    }

    handleStartStreaming = () => {
        console.log('entering handle stream')
        let xSinkID: number = 0
        let srcX = this.xSink
        if (!this.streaming) {
            console.log('streaming was false')
            /**
             * check if a sink exists to stream X axis data to. else create one.
             */
            if (!srcX) {
                srcX = OutputEngine.getInstance().addSink('jacdac accelerometer X axis')
                console.log(`added sink to stream x axis data ${this.xSink}`)
                srcX.addDataHandler(this.state.musicHandler)
                xSinkID = srcX.id
                this.xSink = srcX
            }
            /**
             * check if a observable exists for each of the axes.
             * If not, create an RXJS Subject, filter out null values and change it to be typed as observable<datum>, and then set this as a stream for the source.
             */

            let sourceX = this.xAxisStream
            if (!sourceX) {
                sourceX = new Subject<Datum>()
                this.xAxisStream = sourceX
                OutputEngine.getInstance().setStream(xSinkID, sourceX.pipe(this.filterNullish()))
            }
            OutputEngine.getInstance().next(OutputStateChange.Play)
        } else {
            OutputEngine.getInstance().next(OutputStateChange.Stop)
        }

        this.streaming = !this.streaming
    }

    componentDidMount(): void {
        console.log("mounted")
    }

    handleKeyPress = (event: React.KeyboardEvent<HTMLDivElement>) => {
        console.log("key pressed!")
        let pressedKey = event.code;
        document.querySelector("p")!.textContent = event.code
        if (this.xSink && this.xAxisStream) {
            console.log("sink and stream init")
            this.xAxisStream.next(new Datum(this.xSink.id, this.state.keyFrequencies.get(pressedKey)!))
        }
    }

    public render() {
        return (
            <div id="piano" tabIndex={0} onKeyPress={this.handleKeyPress}>
                <p onClick={this.handleStartStreaming}>Click me to start.</p>
            </div>
        )
    }

}