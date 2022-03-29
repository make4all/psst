import React from 'react'
import { NoteSonify } from '../sonification/output/NoteSonify'
import { SimpleDataHandler } from '../sonification/handler/SimpleDataHandler'
import '../styles/keyboard.css'
import { getKeyFreq, OutputStateChange } from '../sonification/OutputConstants'
import { DataSink } from '../sonification/DataSink'
import { filter, Observable, OperatorFunction, pipe, Subject, UnaryFunction } from 'rxjs'
import { Datum } from '../sonification/Datum'
import { OutputEngine } from '../sonification/OutputEngine'
import { Key } from '../pages/Key'

const DEBUG = false

export interface KeyboardProps {}

export interface KeyboardState {
    musicHandler: SimpleDataHandler
    keyFrequencies : Map<String, number>
    possibleKeys : string[]
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
            keyFrequencies : getKeyFreq(),
            possibleKeys : Array.from(getKeyFreq().keys())
        }
        this.streaming = false
        this.currKey = undefined
    }

    /**
     * helper function to filter out null values from subjects, and create an observable<Datum> for the sink to subscribe.
     * Source: https://stackoverflow.com/questions/57999777/filter-undefined-from-rxjs-observable
     * @returns observable <datum>
     */
    filterNullish<T>(): UnaryFunction<Observable<T | null | undefined>, Observable<T>> {
        return pipe(filter((x) => x != null) as OperatorFunction<T | null | undefined, T>)
    }

    handleStartStreaming = () => {
        console.log('entering handle stream')
        let sinkID: number = 0
        let src = this.sink
        if (!this.streaming) {
            if (DEBUG) console.log('streaming was false')
            /**
             * check if a sink exists to stream data to. else create one
             */
            if (!src) {
                src = OutputEngine.getInstance().addSink('jacdac accelerometer X axis')
                if (DEBUG) console.log(`added sink to stream x axis data ${this.sink}`)
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

    /*
    handleKeyPress = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (!this.streaming) this.handleStartStreaming()
        let pressedKey = event.code;
        if (this.sink && this.stream && this.state.keyFrequencies.has(pressedKey)) {
            document.getElementById(pressedKey)!.style.backgroundColor = "red"
            this.stream.next(new Datum(this.sink.id, this.state.keyFrequencies.get(pressedKey)!))
        }
    }
    */

    handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (!this.streaming) this.handleStartStreaming()
        let keyDown = event.code;
        if (DEBUG) console.log("key down!", keyDown)
        if (this.sink && this.stream && this.state.keyFrequencies.has(keyDown)) {
            document.getElementById(keyDown)!.style.backgroundColor = "blue"
            OutputEngine.getInstance().next(OutputStateChange.Play)
            this.currKey = keyDown
            this.stream.next(new Datum(this.sink.id, this.state.keyFrequencies.get(keyDown)!))
        }
    }

    handleKeyUp = (event: React.KeyboardEvent<HTMLDivElement>) => {
        let keyUp = event.code
        document.getElementById(keyUp)!.style.backgroundColor = "white"
        if (keyUp == this.currKey) {
            OutputEngine.getInstance().next(OutputStateChange.Pause)
            this.currKey = undefined
        }
    }

    public render() {
        return (
            <div id="piano" tabIndex={0} onKeyDown={this.handleKeyDown} onKeyUp={this.handleKeyUp}>
                <button>Click me to start.</button>
                <div>
                    {
                        this.state.possibleKeys.map(function(id, idx){
                            return <Key note={id} key={id}/>
                        })
                    }
                </div>
            </div>
        )
    }

}