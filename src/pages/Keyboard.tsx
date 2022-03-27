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
    private sink : DataSink | undefined
    private stream : Subject<Datum> | undefined
    private currKey : string | undefined

    constructor(props : KeyboardProps) {
        super(props)
        this.state = {
            musicHandler : new SimpleDataHandler(new NoteSonify()),
            keyFrequencies : getKeyFreq()
        }
        this.streaming = false
        this.currKey = undefined
    }

    filterNullish<T>(): UnaryFunction<Observable<T | null | undefined>, Observable<T>> {
        return pipe(filter((x) => x != null) as OperatorFunction<T | null | undefined, T>)
    }

    handleStartStreaming = () => {
        console.log('entering handle stream')
        let sinkID: number = 0
        let src = this.sink
        if (!this.streaming) {
            console.log('streaming was false')
            /**
             * check if a sink exists to stream data to. else create one
             */
            if (!src) {
                src = OutputEngine.getInstance().addSink('jacdac accelerometer X axis')
                console.log(`added sink to stream x axis data ${this.sink}`)
                src.addDataHandler(this.state.musicHandler)
                sinkID = src.id
                this.sink = src
            }
            /**
             * check if a observable exists for the data.
             * If not, create an RXJS Subject, filter out null values and change it to be typed as observable<datum>, and then set this as a stream for the source.
             */

            let sourceX = this.stream
            if (!sourceX) {
                sourceX = new Subject<Datum>()
                this.stream = sourceX
                OutputEngine.getInstance().setStream(sinkID, sourceX.pipe(this.filterNullish()))
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
        if (!this.streaming) this.handleStartStreaming()
        let pressedKey = event.code;
        console.log("key pressed!", pressedKey)
        document.querySelector("p")!.textContent = event.code
        if (this.sink && this.stream && this.state.keyFrequencies.has(pressedKey)) {
            this.stream.next(new Datum(this.sink.id, this.state.keyFrequencies.get(pressedKey)!))
        }
    }

    handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (!this.streaming) this.handleStartStreaming()
        let pressedKey = event.code;
        console.log("key pressed!", pressedKey)
        if (this.sink && this.stream && this.state.keyFrequencies.has(pressedKey)) {
            this.currKey = pressedKey
            document.querySelector("p")!.textContent = pressedKey
            this.stream.next(new Datum(this.sink.id, this.state.keyFrequencies.get(pressedKey)!))
        }
        this.currKey = pressedKey
        document.querySelector("p")!.textContent = pressedKey
    }

    handleKeyUp = (event: React.KeyboardEvent<HTMLDivElement>) => {
        let keyUp = event.code
        if (keyUp == this.currKey) {
            this.handleStartStreaming()
            this.currKey = undefined
        }
    }

    public render() {
        return (
            <div id="piano" tabIndex={0} onKeyPress={this.handleKeyPress}>
                <p>Click me to start.</p>
            </div>
        )
    }

}