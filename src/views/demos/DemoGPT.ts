import { OutputEngine } from '../../sonification/OutputEngine'
import {
    getSonificationLoggingLevel,
    OutputStateChange,
    SonificationLoggingLevel,
} from '../../sonification/OutputConstants'
import { Observable, of, tap, timer, zip, delay } from 'rxjs'
import { NoteHandler } from '../../sonification/handler/NoteHandler'
import { NoteSonify } from '../../sonification/output/NoteSonify'
import { DataSink } from '../../sonification/DataSink'
import { DataHandler } from '../../sonification/handler/DataHandler'
import { FilterRangeHandler } from '../../sonification/handler/FilterRangeHandler'
import { Speech } from '../../sonification/output/Speech'
import { DatumOutput } from 'src/sonification/output/DatumOutput'

import { Datum } from '../../sonification/Datum'

enum HandlerType {
    NoteHandler = 'NoteHandler',
    FilterRangeHandler = 'FilterRangeHandler',
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

function createSpeechOutput(): Speech {
    let output = new Speech(undefined, undefined, undefined, undefined, true)
    return output
}

function createNoteOutput(): NoteSonify {
    let output = new NoteSonify(-1)
    return output
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

function addHandler(sinkId: number, handlerType: HandlerType, min: number = 0, max: number = 0): DataHandler {
    let sink = OutputEngine.getInstance().getSink(sinkId)
    let dataHandler
    if (handlerType === HandlerType.NoteHandler) {
        dataHandler = new NoteHandler([min, max], new NoteSonify(-1))
        sink.addDataHandler(dataHandler)
    } else if (handlerType === HandlerType.FilterRangeHandler) {
        dataHandler = new FilterRangeHandler([min, max], new Speech(undefined, undefined, undefined, undefined, true))
        sink.addDataHandler(dataHandler)
    }

    return dataHandler
}

function addOuput(dataHandler: DataHandler, outputType: OutputType) {
    let output
    if (outputType === OutputType.NoteSonify) {
        output = new NoteSonify(-1)
    } else if (outputType === OutputType.Speech) {
        output = new Speech(undefined, undefined, undefined, undefined, true)
    }

    dataHandler.addOutput(output)
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
functionMap['createSpeechOutput'] = createSpeechOutput
functionMap['createNoteOutput'] = createNoteOutput
functionMap['addHandler'] = addHandler
functionMap['addOuput'] = addOuput

export { functionMap }
