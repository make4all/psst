import { Datum } from '../Datum'
import { getSonificationLoggingLevel, OutputStateChange, SonificationLoggingLevel } from '../OutputConstants';
import { DatumOutput } from './DatumOutput'

const DEBUG = true;

/**
 * Class for sonifying data point as speech.
 */
export class Speech extends DatumOutput {
    private _speechSynthesis : SpeechSynthesis
    private _utterance : SpeechSynthesisUtterance
    private _volume: number;
    private playing: boolean;

    // construct the utterance and set its properties
    public constructor(lang?: string, volume?: number, rate?: number, voice?: SpeechSynthesisVoice) {
        super()
        this._speechSynthesis = window.speechSynthesis;
        this._utterance = new SpeechSynthesisUtterance()
        this._utterance.rate = rate? rate : 10 // rate is 0.1-10
        this._volume = volume? volume : 1 // volume is 0-1
        if (lang) this._utterance.lang = lang
        if (voice) this._utterance.voice = voice
        else{
            this._utterance.voice = this._speechSynthesis.getVoices()[0];
        }
        this.playing = false;
         debugStatic (SonificationLoggingLevel.DEBUG, "initialized")
    }

    /**
     * Output the datum as speech
     */
    protected output(datum: Datum) {
        if (!this.playing) return
        super.output(datum)
        this._utterance.text = datum.value.toString()
        if(this._speechSynthesis.pending || this._speechSynthesis.speaking)
        this._speechSynthesis.cancel()
        this._speechSynthesis.speak(this._utterance)
    }

    // Start speaking
    public start(): void {
        this._utterance.volume = this._volume;
        this._speechSynthesis.resume(); // always resume before speaking. There is a bug on Web Speech that if you pause for more than 15 seconds, speech fails quietly.
        // stop any future utterances
        if (this._speechSynthesis.pending) {
            this._speechSynthesis.cancel();
        }
        // start current utterance
        this.playing = true

        this._utterance.onend = () => { this._utterance.text = ""} // natural end
        super.start();
    }

    // Pause speech if playing.
    public pause(): void {
        this._utterance.volume = 0;
        this._speechSynthesis.cancel();
        this.playing = false
        super.pause();
    }

    // Resume speech if paused.
    public resume(): void {
        this.playing = true
        this._utterance.volume = this._volume;
        this._speechSynthesis.resume();
    }

    // Stop speech.
    public stop(): void {
        if (this._speechSynthesis.pending) {
            this._speechSynthesis.cancel();
        }
        this.playing = false
    }

    public toString() : string {
        return `Speech`
    }
}

//////////// DEBUGGING //////////////////
import { tag } from 'rxjs-spy/operators/tag'
import { Observable, tap } from 'rxjs';

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
    if (DEBUG) {
        if (level >= getSonificationLoggingLevel()) {
            console.log(message)
        } else console.log('debug message dumped')
    }
}