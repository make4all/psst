import React from 'react'
import { NoteSonify } from '../sonification/output/NoteSonify'
import { SimpleDataHandler } from '../sonification/handler/SimpleDataHandler'
import '../styles/keyboard.css'
import { OutputStateChange, getPianoKeys } from '../sonification/OutputConstants'
import { DataSink } from '../sonification/DataSink'
import { filter, Observable, OperatorFunction, pipe, Subject, UnaryFunction } from 'rxjs'
import { Datum } from '../sonification/Datum'
import { OutputEngine } from '../sonification/OutputEngine'
import { NoteHandler } from '../sonification/handler/NoteHandler'
import { MousePositionPianoHandler } from '../sonification/handler/MousePositionPianoHandler'

const DEBUG = false

export interface MouseDemoProps {}

export interface MouseDemoState {
    height : number
    width : number
}


export class MouseDemo extends React.Component<MouseDemoProps, MouseDemoState> {

    private streaming : boolean
    private xSink : DataSink | undefined
    private ySink : DataSink | undefined
    private xStream : Subject<Datum> | undefined
    private yStream : Subject<Datum> | undefined

    constructor(props : MouseDemoProps) {
        super(props)
        this.state = {
            height: window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight,
            width: window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth
        }
        this.streaming = false
        console.log("height", this.state.height)
        console.log("width", this.state.width)
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
        let xSinkID: number = 0
        let ySinkID: number = 1
        let srcX = this.xSink
        let srcY = this.ySink
        if (!this.streaming) {
            if (DEBUG) console.log('streaming was false')
            /**
             * check if a sink exists to stream X axis data to. else create one.
             */
            if (!srcX) {
                srcX = OutputEngine.getInstance().addSink('jacdac accelerometer X axis')
                if (DEBUG) console.log(`added sink to stream x axis data ${this.xSink}`)
                srcX.addDataHandler(new MousePositionPianoHandler ([0, this.state.width], new NoteSonify(-1)))
                xSinkID = srcX.id
                this.xSink = srcX
            }

            /**
             * check if a sink exists to stream Y axis data to. else create one.
             */
            if (!srcY) {
                srcY = OutputEngine.getInstance().addSink('jacdac accelerometer Y axis')
                if (DEBUG) console.log(`added sink to stream y axis data ${this.ySink}`)
                srcY.addDataHandler(new NoteHandler([0, this.state.height], new NoteSonify(1)))
                ySinkID = srcY.id
                this.ySink = srcY
            }
            /**
             * check if a observable exists for each of the axes.
             * If not, create an RXJS Subject, filter out null values and change it to be typed as observable<datum>, and then set this as a stream for the source.
             */

            let sourceX = this.xStream
            if (!sourceX) {
                sourceX = new Subject<Datum>()
                this.xStream = sourceX
                OutputEngine.getInstance().setStream(xSinkID, sourceX.pipe(this.filterNullish()))
            }

            let sourceY = this.yStream
            if (!sourceY) {
                sourceY = new Subject<Datum>()
                this.yStream = sourceY
                OutputEngine.getInstance().setStream(ySinkID, sourceY.pipe(this.filterNullish()))
            }

            OutputEngine.getInstance().next(OutputStateChange.Play)
        } else {
            OutputEngine.getInstance().next(OutputStateChange.Stop)
        }

        this.streaming = !this.streaming
    }

    startDemo = () => {
        if (!this.streaming) {
            this.handleStartStreaming()
            document.addEventListener("mousemove", this.sonifyPosition)
        }
    }

    sonifyPosition = (event: MouseEvent): void => {
        let x = event.offsetX; // should use -1 for pan
        if (this.xSink && this.xStream) {
            OutputEngine.getInstance().next(OutputStateChange.Play)
            this.xStream.next(new Datum(this.xSink.id, x))
        }
        let y = event.offsetY; // should use 1 for pan
        if (this.ySink && this.yStream) {
            OutputEngine.getInstance().next(OutputStateChange.Play)
            this.yStream.next(new Datum(this.ySink.id, y))
        }
    }

    public render() {
        return (
            <div id="mousedemo">
                <button onClick={this.startDemo}>Click to start!</button>
            </div>
        )
    }

}