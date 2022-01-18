// import { SonificationLevel } from './constents';
import { Datum } from "./Datum"
import { PlaybackState, SonificationLevel } from './SonificationConstants'
import { DataSource } from "./DataSource"
import { Template } from "./templates/Template"
import { DatumDisplay } from "./displays/DatumDisplay"
import { Sonify } from "./displays/Sonify"
import { maxHeaderSize } from "http"
import { NetworkWifiRounded } from "@mui/icons-material"

const DEBUG = false;

/**
 * Sonifier class
 * Has a single instance 
 * @todo replace parts of this to use RXjs?
 */
export class Sonifier {
    /**
     * The sonifier. Enfornce that there is only ever one. 
     * @todo ask group if there is a better way to enforce this.
     */
    private static sonifierInstance: Sonifier

    /**
     * Every sonifier has an audio context used to play sounds
     */
    private _audioCtx!: AudioContext
    public get audioCtx(): AudioContext {
        return this._audioCtx
    }
    private gainNode: GainNode;

    /**
     * Whether or not audio is currently playing
     */
    private _playbackState: PlaybackState
    public get playbackState(): PlaybackState {
        return this._playbackState
    }
    public set playbackState(value: PlaybackState) {
        if (DEBUG) console.log("changing playback state")
        this._playbackState = value
    }

    /**
     * A Data sources handled by this sonifier
     */
    private sources: Map<number, DataSource>
    
    /**
     * @returns A dataSource Id that is unique
     */
    public getUniqueId(): number {
        let newId = 0;
        this.sources.forEach((value, key) => {newId = (key > newId) ? key : newId});
        return newId + 1;
    }

    /**
     * @param sourceId An id
     * @returns true if the id is unique (not already in sources)
     */
    public isUnique(sourceId: number) : boolean {
        if (sourceId in this.sources.keys) {
            return false;
        } return true;
    }

    /**
     * Get a source given an Id. Throws an error of sourceId doesn't exist.
     * @param sourceId 
     * @returns Returns the DataSource associated with sourceId. 
     */
    public getSource(sourceId:number) : DataSource {
        let source = this.sources.get(sourceId)
        if (!source) throw new Error(`no source associated with ${sourceId}`)
        return source;
    }

    /**
     * AddSource takes optional arguments, and based on what is provided either constructs
     * a new data source or uses a given one. In either case, it adds it to the set of sources.
     * 
     * @param description A description for the source 
     * @param sourceId A unique id for the source
     * @param source The DataSource object
     */
    public addSource(description?: string, sourceId?: number, source?: DataSource) : DataSource {
        if (! description) description = "Unknown Source"
        if (source) {
            if (!sourceId) sourceId = source.id;
            if (sourceId != source.id) throw Error("sourceId and source.id don't match")
        } else {
            if (sourceId) {
                if (!this.isUnique(sourceId)) throw Error("sourceId is not unique");
                source = new DataSource(sourceId, description);
            } else {
                source = new DataSource(this.getUniqueId(), description);
            }
        }
        this.sources.set(source.id, source);
        return source;
    }
    /**
     * Removes a data source. Once removed, that Id may be re-used.
     * @param sourceId Data source to remove. 
     */
    public deleteSource(source?: DataSource, sourceId?: number) {
        if (source) this.sources.delete(source.id);
        if (sourceId) this.sources.delete(sourceId);
        if (!source && !sourceId) throw Error("Must specify source or ID")
    }

    /**
     * @todo What is this for?
     */
    private _timer: number | undefined
    public get timer(): number | undefined {
        return this._timer
    }
    public set timer(value: number | undefined) {
        this._timer = value
    }

    /**
     * A list of display nodes that are updated on the basis of template changes
     */
    private _displays: Map<Template, DatumDisplay>;
    public getDisplay(key: Template) { return this._displays.get(key); }

    /**
     * Set up the sonifier. Grab the audio context.
     */
    private constructor() {
        // super()
        this._audioCtx = new AudioContext(); // works without needing additional libraries. need to check this when we move away from react as it is currently pulling from react-dom.d.ts.
        this._audioCtx.resume();
        //this.startTime = this.audioCtx.currentTime
        // Always begin in a "stopped" state since there is no data to play yet at construction time
        this._playbackState = PlaybackState.Stopped
        this.sources = new Map();
        this._displays = new Map();
        this.gainNode = this._audioCtx.createGain();
    }

    /**
     * Create a new sonifier. Enforces that there is only ever one
     * @returns The sonifier.
     */
    public static getSonifierInstance(): Sonifier {
        if (!Sonifier.sonifierInstance) {
            Sonifier.sonifierInstance = new Sonifier()
        }

        return Sonifier.sonifierInstance
    }

    //needs extensive testing.
    public onStop() {
        // @todo do I need to do anything differently if was stopped instead of paused?
        // The answer is yes if we ever want to handl control to a new/different audio context
        // maybe have an option for "halt" instead that ends everything?

        this.audioCtx.suspend();
        if (DEBUG) console.log("stopping. playback state is paused");
        this._playbackState = PlaybackState.Paused;
        // this.audioCtx.close() -- gives everything up, should only be done at the very very end.
    }

    //needs extensive testing.
    public onPlay() {
        // @todo do I need to do anything differently if was stopped instead of paused?
        // The answer is yes if we ever want to handl control to a new/different audio context
        if (this.playbackState == PlaybackState.Playing && this.audioCtx.state == 'running') {
            if (DEBUG) console.log('playing')
        } else {
            if (DEBUG) console.log('setting up for playing')
            this.audioCtx.resume()
            this.gainNode.connect(this._audioCtx.destination);
            this.startSources();
            this._playbackState = PlaybackState.Playing
        }
    }

    /**
     * Triggers all existing audio nodes to play.
     */
    public startSources() {
        if (DEBUG) console.log(`starting sources ${this.sources.size}`)
        this.sources.forEach((source: DataSource, key: number) => {
            source.displays().map((display) => {
                if (DEBUG) console.log(`Source: ${source} Display: ${display.toString()}`);
                let sonify = display as Sonify;
                let audioNode = sonify.getAudioNode(this);
                if (audioNode != undefined) {
                    audioNode.connect(this.gainNode);
                }
            });
        });
        this.gainNode.connect(this._audioCtx.destination);
    }

    //needs extensive testing.
    public onPause() {
        if (DEBUG) console.log('Pausing. Playback state is paused')
        this.audioCtx.suspend();
        this.gainNode.disconnect();
        this._playbackState = PlaybackState.Paused;
    }

    public initializeSource(sourceID: number, description?: string) : DataSource {
        if (!description) description = "Unknown Source";
        return new DataSource(sourceID, description);
    }

    public pushPoint(point: number, sourceId: number): Datum { // datum: Datum, source: DataSource) {
        if (DEBUG) console.log(`pushPoint ${point} for ${sourceId} during ${this.playbackState} `)
        let source = this.sources.get(sourceId);
        if (!source) throw new Error(`no source associated with ${sourceId}`)
        if (DEBUG) console.log(`Source ${source}`)
        let datum = new Datum(sourceId, point);
        switch (this.playbackState) {
            case PlaybackState.Stopped: // ignore the point
                if (DEBUG) console.log(`playback: Stopped`)
                break;
            case PlaybackState.Playing: {
                if (DEBUG) console.log(`calling ${source} to handle ${{datum}}`)
                source.handleNewDatum(datum);
                /// make sounds update properly
                //datum.displays.map((display) => { if (DEBUG) console.log(display.toString()); });
                break;
            }
            case PlaybackState.Paused: {
                if (DEBUG) console.log(`playback: paused`)
                /// @todo what should we do? Keep a buffer of points and delay them? something else?
            }
        }
        return datum;
    }
}
