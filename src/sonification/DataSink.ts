import { BehaviorSubject, Observable, ReplaySubject, tap } from 'rxjs'
import {
    getSonificationLoggingLevel,
    NullableDatum,
    OutputStateChange,
    SonificationLoggingLevel,
} from './OutputConstants'
import { DataHandler } from './handler/DataHandler'
import { ThirtyFpsSelectOutlined } from '@mui/icons-material'

/**
 * The DataSink for a stream of data
 */
export class DataSink extends BehaviorSubject<[OutputStateChange, NullableDatum]> {
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
        this._dataHandlers.push(dataHandler)
        debugStatic(SonificationLoggingLevel.DEBUG, 'Setting up handler subscription by calling setSubscription')
        dataHandler.setupSubscription(this)
        debugStatic(SonificationLoggingLevel.DEBUG, 'Set up handler subscription by calling setSubscription')
    }

    //////////////////////////////// CONSTRUCTOR ///////////////////////////////////

    /**
     * Instantiate a DataSink
     * @param id A unique ID for the DataSink
     * @param description A description for the DataSink
     */
    constructor(id: number, description: String) {
        super([OutputStateChange.Undefined, undefined])
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
    public setupSubscription(statedatum$: Observable<[OutputStateChange, NullableDatum]>) {
        statedatum$.pipe(debug(SonificationLoggingLevel.DEBUG, `outputing to ${this}`)).subscribe(this)
    }

    public toString() {
        let description = this._description
        description += `(id: ${this.id})`
        return description
    }
}

const debug = (level: number, message: string) => (source: Observable<any>) =>
    source.pipe(
        tap((val) => {
            debugStatic(level, message + ': ' + val.toString())
        }),
    )
const debugStatic = (level: number, message: string) => {
    if (level >= getSonificationLoggingLevel()) {
        console.log(message)
    } //else console.log('debug message dumped')
}
