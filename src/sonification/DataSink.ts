import { BehaviorSubject, Observable, ReplaySubject, tap } from 'rxjs'
import { getSonificationLoggingLevel, OutputStateChange, SonificationLoggingLevel, StateDatum } from './OutputConstants'
import { DataHandler } from './handler/DataHandler'

/**
 * The DataSink for a stream of data
 */
export class DataSink extends BehaviorSubject<StateDatum> {
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
    }

    //////////////////////////////// CONSTRUCTOR ///////////////////////////////////

    /**
     * Instantiate a DataSink
     * @param id A unique ID for the DataSink
     * @param description A description for the DataSink
     */
    constructor(id: number, description: String) {
        super({ state: OutputStateChange.Undefined, datum: undefined })
        this.id = id
        this._description = description
        this._dataHandlers = new Array<DataHandler>()
    }

    //////////////////////////////// HELPER METHODS ///////////////////////////////////

    public toString() {
        let description = this._description
        description += `(id: ${this.id})`
        return description
    }
}

const debug = (level: number, message: string) => (source: Observable<any>) =>
    source.pipe(
        tap((val) => {
            debugStatic(level, message + ': ' + val)
        }),
    )
const debugStatic = (level: number, message: string) => {
    if (level >= getSonificationLoggingLevel()) {
        console.log(message)
    } //else console.log('debug message dumped')
}
