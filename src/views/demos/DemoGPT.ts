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

import { Datum } from '../../sonification/Datum'

const DEBUG = true

function addSink(description?: string, sinkId?: number, dataSink?: DataSink, stream$?: Observable<Datum>): DataSink {
    return OutputEngine.getInstance().addSink(description, sinkId, dataSink, stream$)
}

function getSink(sinkId: number): DataSink {
    let sink = OutputEngine.getInstance().getSink(sinkId)
    if (sink) return sink
    else throw new Error('Sink not found')
}

function deleteSink(sinkId?: number, sink?: DataSink) {
    OutputEngine.getInstance().deleteSink(sink, sinkId)
}

function sonify1D(data: number[], sinkName: string) {
    let current = 0
    debugStatic(SonificationLoggingLevel.DEBUG, `adding sink`)
    let sink = OutputEngine.getInstance().addSink(sinkName)
    debugStatic(SonificationLoggingLevel.DEBUG, `in onPlay ${sink}, `)

    let dataCopy = Object.assign([], data)
    let data$ = of(...data)
    let id = sink ? sink.id : 0
    let timer$ = timer(0, 250).pipe(debug(SonificationLoggingLevel.DEBUG, 'point number'))
    let source$ = zip(data$, timer$, (num, time) => new Datum(id, num)).pipe(
        debug(SonificationLoggingLevel.DEBUG, 'point'),
    )
    OutputEngine.getInstance().setStream(id, source$)

    sink?.addDataHandler(
        new NoteHandler(
            [
                data.reduce((prev, curr) => (prev < curr ? prev : curr)), // min
                data.reduce((prev, curr) => (prev > curr ? prev : curr)),
            ],
            new NoteSonify(-1),
        ),
    )
    OutputEngine.getInstance().next(OutputStateChange.Play)
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

functionMap['sonify1D'] = sonify1D
functionMap['addSink'] = addSink
functionMap['getSink'] = getSink
functionMap['deleteSink'] = deleteSink

export { functionMap }
