import { map, Observable, tap, Subject } from 'rxjs'
import { getSonificationLoggingLevel, OutputStateChange, SonificationLoggingLevel } from './OutputConstants'
import { DataHandler } from './handler/DataHandler'

const DEBUG = false

/**
 * The DataSink for a stream of data
 */
export class DataSink extends Subject<OutputStateChange | Datum> {
    //////////////////////////////// FIELDS ///////////////////////////////////

    /**
     * A unique id for this DataSink
     */
    public id: number

    /**
     * A description of this DataSink for documentation
     */
    private _description: String

    //////////////////////////////// HANDLERS ///////////////////////////////////
    /**
     * A list of DataHandlers. DataHandlers are passed each new Datum when it arrives.
     */
    private _dataHandlers: Array<DataHandler>
    public removeDataHandler(dataHandler: DataHandler) {
        this._dataHandlers = this._dataHandlers.filter((dataHandler) => dataHandler !== dataHandler)
    }
    public addDataHandler(dataHandler: DataHandler) {
        debugStatic(SonificationLoggingLevel.DEBUG,`Adding data handeler: ${dataHandler}. length of _handelers of sink is ${this._dataHandlers.length}`)
        let observable = this as Observable<OutputStateChange | Datum>
        if (this._dataHandlers.length > 0)
            observable = this._dataHandlers[this._dataHandlers.length - 1] as Observable<OutputStateChange | Datum>
        debugStatic(SonificationLoggingLevel.DEBUG, `printing ${observable}`)
        dataHandler.setupSubscription(observable)
        this._dataHandlers.push(dataHandler)
    }

    //////////////////////////////// CONSTRUCTOR ///////////////////////////////////

    /**
     * Instantiate a DataSink
     * @param id A unique ID for the DataSink
     * @param description A description for the DataSink
     */
    constructor(id: number, description: String) {
        super()
        this.id = id
        this._description = description
        this._dataHandlers = new Array<DataHandler>()
    }

    //////////////////////////////// HELPER METHODS ///////////////////////////////////
    /**
     * Subscribe to the OutputEngine (override to modify or filter the stream in some way)
     *
     * @param engine$ An Output's stream of Datum comes from a DataHandlar
     */
    public setupSubscription(statedatum$: Observable<OutputStateChange | Datum>) {
        statedatum$
            .pipe(
                map((val) => {
                    if (val instanceof Datum) val.sinkId = this.id

                    return val
                }),
                debug(SonificationLoggingLevel.DEBUG, `dataSink`, DEBUG),
            )
            .subscribe(this)
    }

    public toString() {
        let description = this._description
        description += `(id: ${this.id})`
        return description
    }
}

//////////// DEBUGGING //////////////////
import { tag } from 'rxjs-spy/operators/tag'
import { Datum } from './Datum'
const debug = (level: number, message: string, watch: boolean) => (source: Observable<any>) => {
    if (watch) {
        return source.pipe(tag(message))
    } else {
        return source.pipe(
            tap((val) => {
                debugStatic(level, message + ': ' + val)
            }),
        )
    }
}

const debugStatic = (level: number, message: string) => {
    if (DEBUG) {
        if (level >= getSonificationLoggingLevel()) {
            console.log(message)
        } else console.log('debug message dumped')
    }
}
