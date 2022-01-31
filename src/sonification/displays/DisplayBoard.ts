// import { SonificationLevel } from './constents';
import { Datum } from '../Datum'
import { DisplayState } from '../SonificationConstants'
import { DataSource } from '../DataSource'
import { Template } from '../templates/Template'
import { DatumDisplay } from './DatumDisplay'

const DEBUG = false

/**
 * DisplayBoard class
 * Has a single instance
 * users of our library get an instance of this to control it i.e. get source, play, etc.
 * @todo replace parts of this to use RXjs?
 */
export class DisplayBoard {
    /**
     * The display board. Enforce that there is only ever one.
     * @todo ask group if there is a better way to enforce this.
     */
    private static displayBoardInstance: DisplayBoard

    /**
     * Whether or not audio is currently playing.
     * Always begin in a "stopped" state since there is
     * no data to play yet at construction time
     */
    private _displayState = DisplayState.Stopped
    public get displayState(): DisplayState {
        return this._displayState
    }
    public set displayState(value: DisplayState) {
        if (DEBUG) console.log('changing display state')
        this._displayState = value
    }

    /**
     * Amap of Data sources handled by the display board.
     */
    private sources: Map<number, DataSource>

    /**
     * @returns A dataSource Id that is unique
     */
    public getUniqueId(): number {
        let newId = 0
        this.sources.forEach((value, key) => {
            newId = key > newId ? key : newId
        })
        return newId + 1
    }

    /**
     * @param sourceId An id
     * @returns true if the id is unique (not already in sources)
     */
    public isUnique(sourceId: number): boolean {
        if (sourceId in this.sources.keys) {
            return false
        }
        return true
    }

    /**
     * Get a source given an Id. Throws an error of sourceId doesn't exist.
     * @param sourceId
     * @returns Returns the DataSource associated with sourceId.
     */
    public getSource(sourceId: number): DataSource {
        let source = this.sources.get(sourceId)
        if (!source) throw new Error(`no source associated with ${sourceId}`)
        return source
    }

    /**
     * AddSource takes optional arguments, and based on what is provided either constructs
     * a new data source or uses a given one. In either case, it adds it to the set of sources.
     *
     * @param description A description for the source
     * @param sourceId A unique id for the source
     * @param source The DataSource object
     */
    public addSource(description?: string, sourceId?: number, source?: DataSource): DataSource {
        if (!description) description = 'Unknown Source'
        if (source) {
            if (!sourceId) sourceId = source.id
            if (sourceId != source.id) throw Error("sourceId and source.id don't match")
        } else {
            if (sourceId) {
                if (!this.isUnique(sourceId)) throw Error('sourceId is not unique')
                source = new DataSource(sourceId, description)
            } else {
                source = new DataSource(this.getUniqueId(), description)
            }
        }
        this.sources.set(source.id, source)
        return source
    }
    /**
     * Removes a data source. Once removed, that Id may be re-used.
     * @param sourceId Data source to remove.
     */
    public deleteSource(source?: DataSource, sourceId?: number) {
        if (source) this.sources.delete(source.id)
        if (sourceId) this.sources.delete(sourceId)
        if (!source && !sourceId) throw Error('Must specify source or ID')
    }

    /**
     * Set up the display board. set up maps needed to keep track of sources and displays.
     */
    private constructor() {
        this.sources = new Map()
    }

    /**
     * Create a new display board. Enforces that there is only ever one
     * @returns The display board's instance..
     */
    public static getInstance(): DisplayBoard {
        if (!DisplayBoard.displayBoardInstance) {
            DisplayBoard.displayBoardInstance = new DisplayBoard()
        }

        return DisplayBoard.displayBoardInstance
    }

    //needs extensive testing.
    public onStop() {
        // @todo do I need to do anything differently if was stopped instead of paused?
        // The answer is yes if we ever want to handl control to a new/different audio context
        // maybe have an option for "halt" instead that ends everything?

        if (DEBUG) console.log('stopping. display state is paused')
        this._displayState = DisplayState.Stopped
        // this.audioCtx.close() -- gives everything up, should only be done at the very very end.
    }

    //needs extensive testing.
    public onPlay() {
        // @todo do I need to do anything differently if was stopped instead of paused?
        // The answer is yes if we ever want to handl control to a new/different audio context
        if (this.displayState == DisplayState.Displaying) {
            if (DEBUG) console.log('playing')
        } else {
            if (DEBUG) console.log('setting up for playing')

            this.startSources()
            this._displayState = DisplayState.Displaying
        }
    }

    /**
     * Triggers all existing sources to show themselves (e.g. set up for playing)
     *
     * @todo if a new source is added after onPlay it won't get connected
     * @todo what about visually displaying things
     */
    private startSources() {
        if (DEBUG) console.log(`starting sources ${this.sources.size}`)
        this.sources.forEach((source: DataSource, key: number) => source.startDisplays())
    }

    //needs extensive testing.
    public onPause() {
        if (DEBUG) console.log('Pausing. Playback state is paused')
        this._displayState = DisplayState.Paused
        this.sources.forEach((source: DataSource, key: number) => source.stopDisplays())
    }

    /**
     * Plays each data point as it arrives.
     * @param point The point to sonify
     * @param sourceId The source that point is associated with
     * @returns The resulting data point
     */
    public pushPoint(point: number, sourceId: number): Datum {
        // datum: Datum, source: DataSource) {
        if (DEBUG) console.log(`pushPoint ${point} for ${sourceId} during ${this.displayState} `)
        let source = this.sources.get(sourceId)
        if (!source) throw new Error(`no source associated with ${sourceId}`)
        if (DEBUG) console.log(`Source ${source}`)
        let datum = new Datum(sourceId, point)
        switch (this.displayState) {
            case DisplayState.Stopped: // ignore the point
                if (DEBUG) console.log(`playback: Stopped`)
                break
            case DisplayState.Displaying: {
                if (DEBUG) console.log(`calling ${source} to handle ${{ datum }}`)
                source.handleNewDatum(datum)

                break
            }
            case DisplayState.Paused: {
                if (DEBUG) console.log(`playback: paused`)
                /// @todo what should we do? Keep a buffer of points and delay them? something else?
            }
        }
        return datum
    }
}
