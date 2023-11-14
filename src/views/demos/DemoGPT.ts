import { OutputEngine } from '../../sonification/OutputEngine'
import {
    getSonificationLoggingLevel,
    OutputStateChange,
    SonificationLoggingLevel,
} from '../../sonification/OutputConstants'
import { Observable, of, tap, timer, zip, delay } from 'rxjs'
import { NoteHandler } from '../../sonification/handler/NoteHandler'
import { NoteSonify } from '../../sonification/output/NoteSonify'

import { Datum } from '../../sonification/Datum'

const DEBUG = false

function sonify1D(data: number[], sinkName: string) {
    let current = 0
    debugStatic(SonificationLoggingLevel.DEBUG, `adding sink`)
    let sink = OutputEngine.getInstance().addSink('GPTDemoSink')
    debugStatic(SonificationLoggingLevel.DEBUG, `in onPlay ${sink}, `)

    let dataCopy = Object.assign([], data)
    let data$ = of(...data)
    let id = sink ? sink.id : 0
    let timer$ = timer(0, 250).pipe(debug(SonificationLoggingLevel.DEBUG, 'point number'))
    let source$ = zip(data$, timer$, (num, time) => new Datum(id, num)).pipe(
        debug(SonificationLoggingLevel.DEBUG, 'point'),
    )

    sink?.addDataHandler(
        new NoteHandler(
            [
                data.reduce((prev, curr) => (prev < curr ? prev : curr)), // min
                data.reduce((prev, curr) => (prev > curr ? prev : curr)),
            ],
            new NoteSonify(-1),
        ),
    ) // max
    console.log('Hello')
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

export { functionMap }
