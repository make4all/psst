import { OutputEngine } from '../sonification/OutputEngine'
import {
    getSonificationLoggingLevel,
    OutputStateChange,
    SonificationLoggingLevel,
} from '../sonification/OutputConstants'
import { Observable, of, tap, timer, zip, delay } from 'rxjs'
import { NoteSonify } from '../sonification/output/NoteSonify'
import { DataSink } from '../sonification/DataSink'
import { DataHandler } from '../sonification/handler/DataHandler'
import { FilterRangeHandler } from '../sonification/handler/FilterRangeHandler'
import { NoteHandler } from '../sonification/handler/NoteHandler'
import { NotificationHandler } from '../sonification/handler/NotificationHandler'
import { RunningExtremaHandler } from '../sonification/handler/RunningExtremaHandler'
import { SlopeParityHandler } from '../sonification/handler/SlopeParityHandler'
import { SpeechHandler } from '../sonification/handler/SpeechHandler'
import { Speech } from '../sonification/output/Speech'
import { DatumOutput } from 'src/sonification/output/DatumOutput'

import { Datum } from '../sonification/Datum'

enum HandlerType {
    NoteHandler = 'NoteHandler', // [min, ,max] number in hertz
    FilterRangeHandler = 'FilterRangeHandler', // [min, max] in number
    NotificationHandler = 'NotificationHandler', // number[]
    RunningExtremaHandler = 'RunningExtremaHandler', // -1 for min, 1 for max
    SlopeParityHandler = 'SlopeParityHandler', // -1 for decreasing, 1 for increasing
    SpeechHandler = 'SpeechHandler', // volume: number
}

enum OutputType {
    NoteSonify = 'NoteSonify',
    Speech = 'Speech',
}

const DEBUG = true

function addSink(description?: string, sinkId?: number): number {
    let sink = OutputEngine.getInstance().addSink(description, sinkId, undefined, undefined)

    if (sink) {
        return sink.id
    } else throw new Error('Sink not found')
}

function getSink(sinkId: number): DataSink {
    try {
        let sink = OutputEngine.getInstance().getSink(sinkId)
        if (sink) return sink
        else throw new Error('Sink not found')
    } catch (e) {
        console.log(e)
        throw new Error('Sink not found')
    }
}

function deleteSink(sinkId?: number): void {
    OutputEngine.getInstance().deleteSink(undefined, sinkId)
}

// function sonify1D(data: number[], sinkName: string) {
//     let current = 0
//     debugStatic(SonificationLoggingLevel.DEBUG, `adding sink`)
//     let sink = OutputEngine.getInstance().addSink(sinkName)
//     debugStatic(SonificationLoggingLevel.DEBUG, `in onPlay ${sink}, `)

//     let dataCopy = Object.assign([], data)
//     let data$ = of(...data)
//     let id = sink ? sink.id : 0
//     let timer$ = timer(0, 250).pipe(debug(SonificationLoggingLevel.DEBUG, 'point number'))
//     let source$ = zip(data$, timer$, (num, time) => new Datum(id, num)).pipe(
//         debug(SonificationLoggingLevel.DEBUG, 'point'),
//     )

//     OutputEngine.getInstance().setStream(id, source$)

//     sink?.addDataHandler(
//         new NoteHandler(
//             [
//                 data.reduce((prev, curr) => (prev < curr ? prev : curr)), // min
//                 data.reduce((prev, curr) => (prev > curr ? prev : curr)),
//             ],
//             new NoteSonify(-1),
//         ),
//     )

//     OutputEngine.getInstance().next(OutputStateChange.Play)
// }

function addNoteHandler(sinkId: number, min: number = 0, max: number = 0): DataHandler {
    let sink = OutputEngine.getInstance().getSink(sinkId)
    let dataHandler = new NoteHandler([min, max])
    sink.addDataHandler(dataHandler)
    return dataHandler
}

function addFilterRangeHandler(sinkId: number, min: number = Number.MIN_VALUE, max: number = Number.MAX_VALUE) {
    let sink = OutputEngine.getInstance().getSink(sinkId)
    let dataHandler = new FilterRangeHandler([min, max])
    sink.addDataHandler(dataHandler)
    return dataHandler
}

function addNotificationHandler(sinkId: number, interestPoints: number[]) {
    let sink = OutputEngine.getInstance().getSink(sinkId)
    let dataHandler = new NotificationHandler(undefined, interestPoints)
    sink.addDataHandler(dataHandler)
    return dataHandler
}

function addRunningExtremaHandler(sinkId: number, direction: number = 1) {
    let sink = OutputEngine.getInstance().getSink(sinkId)
    let dataHandler = new RunningExtremaHandler(direction)
    sink.addDataHandler(dataHandler)
    return dataHandler
}

function addSlopeParityHandler(sinkId: number, direction: number = 0) {
    let sink = OutputEngine.getInstance().getSink(sinkId)
    let dataHandler = new SlopeParityHandler(direction)
    sink.addDataHandler(dataHandler)
    return dataHandler
}

function addSpeechHandler(sinkId: number, volume: number = 1) {
    let sink = OutputEngine.getInstance().getSink(sinkId)
    let dataHandler = new SpeechHandler(volume)
    sink.addDataHandler(dataHandler)
    return dataHandler
}

function addNoteSonifyOutput(dataHandler: DataHandler) {
    let output = new NoteSonify(-1)
    dataHandler.addOutput(output)
}

function addSpeechOutput(dataHandler: DataHandler) {
    let output = new Speech(undefined, undefined, undefined, undefined, true)
    dataHandler.addOutput(output)
}

function addOutput(dataHandler: DataHandler, outputType: OutputType) {
    let output
    if (outputType === OutputType.NoteSonify) {
        output = new NoteSonify(-1)
    } else if (outputType === OutputType.Speech) {
        output = new Speech(undefined, undefined, undefined, undefined, true)
    }

    dataHandler.addOutput(output)
}

function createSonification(
    handlerType: HandlerType,
    outputType: OutputType,
    description?: string,
    max?: number,
    min?: number,
    interestPoints: number[] = [0],
    direction?: number,
    volume?: number,
) {
    let sinkId = addSink(description)

    let dataHandler
    if (handlerType == HandlerType.NoteHandler) {
        dataHandler = addNoteHandler(sinkId, min, max)
    }
    if (handlerType == HandlerType.FilterRangeHandler) {
        dataHandler = addFilterRangeHandler(sinkId, min, max)
    }
    if (handlerType == HandlerType.NotificationHandler) {
        dataHandler = addNotificationHandler(sinkId, interestPoints)
    }
    if (handlerType == HandlerType.RunningExtremaHandler) {
        dataHandler = addRunningExtremaHandler(sinkId, direction)
    }
    if (handlerType == HandlerType.SlopeParityHandler) {
        dataHandler = addSlopeParityHandler(sinkId, direction)
    }

    if (handlerType == HandlerType.SpeechHandler) {
        dataHandler = addSpeechHandler(sinkId, volume)
    }

    if (outputType == OutputType.NoteSonify) addNoteSonifyOutput(dataHandler)

    if (outputType == OutputType.Speech) addSpeechOutput(dataHandler)
}

const debug = (level: number, message: string) => (source: Observable<any>) =>
    source.pipe(
        tap((val) => {
            debugStatic(level, message + ': ' + val)
        }),
    )
const debugStatic = (level: number, message: string) => {
    if (DEBUG) {
        if (level >= getSonificationLoggingLevel()) {
            console.log(message)
        } //else console.log('debug message dumped')
    }
}

let functionMap = {}

// functionMap['sonify1D'] = sonify1D
functionMap['addSink'] = addSink
functionMap['getSink'] = getSink
functionMap['deleteSink'] = deleteSink
functionMap['createSonification'] = createSonification

export { functionMap }
