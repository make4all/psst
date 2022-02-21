import { lastValueFrom, Observable, Subject, tap } from 'rxjs'
import { Datum } from '../Datum'
import { getSonificationLoggingLevel, OutputStateChange, SonificationLoggingLevel } from '../OutputConstants'


const DEBUG = false


/**
 * Base class for outputing information about a single datum. Must be subclassed to be fully defined
 * @field datum The raw data used to generate this sonification type
 */
export abstract class DatumOutput extends Subject<OutputStateChange | Datum> {
    /**
     * Are we playing right now?
     */
    private state = OutputStateChange.Undefined

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
                    if (val instanceof Datum) {
                        debugStatic(SonificationLoggingLevel.DEBUG, `datum is  ${val}`)
                        if (this.state == OutputStateChange.Play) {
                            this.output(val)
                        }
                    } else {
                        debugStatic(
                            SonificationLoggingLevel.DEBUG,
                            `setting up state ${OutputStateChange[val]}: was ${OutputStateChange[this.state]}`,
                        )
                        switch (val as OutputStateChange) {
                            case OutputStateChange.Play:
                                if (this.state == OutputStateChange.Stop || this.state == OutputStateChange.Undefined)
                                    this.start()
                                else if (this.state == OutputStateChange.Pause) this.resume()
                                break
                            case OutputStateChange.Stop:
                                this.stop()
                                break
                            case OutputStateChange.Pause:
                                this.pause()
                                break
                            case OutputStateChange.Undefined:
                                break
                            case OutputStateChange.Swap:
                                Error(
                                    'this should not happen -- OutputEngine should handle swaps and never send them on',
                                )
                                break
                        }
                        this.state = val
                    }
                }),

                debug(SonificationLoggingLevel.DEBUG, `output`, DEBUG),

            )
            .subscribe(this)
    }

    /**
     * Stop all output. Stream has ended.
     */
    complete(): void {
        this.stop()
    }

    /**
     * Stop all output.
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
     * Resume any output
     */
    protected resume() {}

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
// import { tag } from 'rxjs-spy/operators/tag'
const debug(level: number, message: string, watch: boolean) {
    return (source: Observable<any>) => {
        if (watch) {
            return source.pipe(
                tap((val) => {
                    debugStatic(level, message + ': ' + val)
                }),
                tag(message)
            )
        } else {
            return source.pipe(
                tap((val) => {
                    debugStatic(level, message + ': ' + val)
                })
            )
        }
    }
}

const debugStatic = (level: number, message: string) => {
    if (DEBUG) {
        if (level >= getSonificationLoggingLevel()) {
            console.log(message)
        } //else console.log('debug message dumped')

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
    } //else console.log('debug message dumped')
}
