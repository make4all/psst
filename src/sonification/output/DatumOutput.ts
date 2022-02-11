import { lastValueFrom, Observable, ReplaySubject, tap } from 'rxjs'
import { Datum } from '../Datum'
import { getSonificationLoggingLevel, OutputStateChange, SonificationLoggingLevel } from '../OutputConstants'

/**
 * Base class for outputing information about a single datum. Must be subclassed to be fully defined
 * @field datum The raw data used to generate this sonification type
 */
export abstract class DatumOutput extends ReplaySubject<OutputStateChange | Datum> {
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
    public setupSubscription(stream$: Observable<OutputStateChange | Datum>) {
        debugStatic(SonificationLoggingLevel.DEBUG, 'setting up output subscription')
        stream$
            .pipe(
                tap((val) => {
                    debugStatic(SonificationLoggingLevel.DEBUG, `val is  ${val}`)
                    if (val instanceof Datum) {
                        debugStatic(SonificationLoggingLevel.DEBUG, `datum is  ${val}`)
                        if (this.playing) {
                            this.output(val)
                            return
                        }
                    }
                    debugStatic(SonificationLoggingLevel.DEBUG, `setting up state`)
                    switch (val) {
                        case OutputStateChange.Play:
                            if (!this.playing) this.start()
                            this.playing = true
                            break
                        case OutputStateChange.Stop:
                            this.stop()
                            this.playing = false
                            break
                        case OutputStateChange.Pause:
                            this.pause()
                            this.playing = false
                            break
                        case OutputStateChange.Undefined:
                            break
                        case OutputStateChange.Swap:
                            Error('this should not happen -- OutputEngine should handle swaps and never send them on')
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
    protected start() {
        debugStatic(SonificationLoggingLevel.DEBUG, 'Play was called')
    }

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
