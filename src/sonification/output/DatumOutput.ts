import { distinctUntilChanged, filter, lastValueFrom, Observable, Observer, ReplaySubject, Subject, tap } from 'rxjs'
import { Datum } from '../Datum'
import { DataHandler } from '../handler/DataHandler'
import { getSonificationLoggingLevel, OutputStateChange, SonificationLoggingLevel } from '../OutputConstants'

/**
 * Base class for outputing information about a single datum. Must be subclassed to be fully defined
 * @field datum The raw data used to generate this sonification type
 */
export abstract class DatumOutput extends ReplaySubject<[OutputStateChange, Datum]> {
    /**
     * Are we playing right now?
     */
    private _playing = false
    public get playing() {
        return this._playing
    }
    public set playing(value) {
        this._playing = value
    }

    /**
     * Subscribe to the handler (override to modify or filter the stream in some way)
     *
     * @param stream$ An Output's stream of Datum comes from a DataHandlar
     */
    public setupSubscription(stream$: Observable<[OutputStateChange, Datum]>) {
        debugStatic(SonificationLoggingLevel.DEBUG, 'setting up output subscription')
        stream$
            .pipe(
                tap(([state, datum]) => {
                    debugStatic(SonificationLoggingLevel.DEBUG, `state is  ${state}`)
                    switch (state) {
                        case OutputStateChange.Play:
                            if (!this.playing) this.start()
                            if (datum) this.output(datum)
                            break
                        case OutputStateChange.Stop:
                            this.stop()
                            break
                        default:
                            this.pause()
                            break
                    }
                }),
                debug(SonificationLoggingLevel.DEBUG, `output`, true),
            )
            .subscribe(this)
    }

    /**
     * Stop all output. Stream has ended.
     */
    protected stop() {}
    /**
     * Do any setup for outputing node
     */
    protected start() {}

    /**
     * Pause any output
     */
    protected pause() {}

    /**
     * Show the output
     */
    protected output(datum: Datum) {
        debugStatic(SonificationLoggingLevel.DEBUG, `updating value  ${datum}`)
    }

    /**
     * Prints a description of this output
     */
    public toString(): string {
        return `${lastValueFrom(this)}$`
    }
}

//////////// DEBUGGING //////////////////
import { tag } from 'rxjs-spy/operators/tag'
const debug = (level: number, message: string, watch: boolean) => (source: Observable<any>) => {
    if (watch) {
        return source.pipe(
            tap((val) => {
                debugStatic(level, message + ': ' + val)
            }),
            tag(message),
        )
    } else {
        return source.pipe(
            tap((val) => {
                debugStatic(level, message + ': ' + val)
            }),
        )
    }
}

const debugStatic = (level: number, message: string) => {
    if (level >= getSonificationLoggingLevel()) {
        console.log(message)
    } else console.log('debug message dumped')
}
