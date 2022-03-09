import { map, Observable, tap, Subject } from 'rxjs'
import { getSonificationLoggingLevel, OutputStateChange, SonificationLoggingLevel } from './OutputConstants'
import { DataHandler } from './handler/DataHandler'

const DEBUG = true

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
     * A list of DataHandler chains. DataHandlers are passed each new Datum when it arrives.
     * We store only the first and last handler in the chain.
     */
    private _dataHandlers: Map<number, [Observable<OutputStateChange | Datum>, Observable<OutputStateChange | Datum>]>

    /**
     * Adds a new data handler. Creates a chain based on what is passed in.
     * Only the last handler in the chain is stored, since that's what we "attach" to.
     *
     * @param dataHandler The data handler to add
     * @param key The chain to add it to. If not specified, creates a new chain
     * @return The key for the new chain, or the key passed in.
     */
    public addDataHandler(dataHandler: DataHandler, chain: boolean, key?: number): number {
        let observable, head, caboose
        let maxKey = 0
        console.log('key' + key)

        if (chain) {
            head = this._dataHandlers[key as number][0]
            caboose = this._dataHandlers[key as number][1]
            observable = caboose
        } else {
            // figure out whether a key was provided and is already in the map.
            // if so, we will subscribe to the tail of that chain
            // if not, we will create a new key larger than all previous ones (so it is unique)
            // and subscribe to this data sink
            for (let handlerId of this._dataHandlers.keys()) {
                console.log('key' + key + ', ' + handlerId)
                if (handlerId > maxKey) maxKey = handlerId
                key = maxKey + 1
            }
            observable = head = this
        }
        debugStatic(SonificationLoggingLevel.DEBUG, `printing ${observable} with key ${key}`)
        dataHandler.setupSubscription(observable)
        this._dataHandlers.set(key as number, [head, dataHandler])
        debugStatic(
            SonificationLoggingLevel.DEBUG,
            `Added data handeler: ${dataHandler} with key ${key} to caboose ${observable}.`,
        )
        return key as number
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
        this._dataHandlers = new Map<number, [DataHandler, DataHandler]>()
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
import { JD_ADVERTISEMENT_0_ACK_SUPPORTED } from 'jacdac-ts'
import { PrintOutlined } from '@mui/icons-material'
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
        } //else console.log('debug message dumped')
    }
}
