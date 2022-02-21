import { Datum } from '../Datum'
import { OutputStateChange } from '../OutputConstants';
import { DatumOutput } from './DatumOutput'
const DEBUG = true;
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
        if(DEBUG) console.log("initialized")
    }

    /**
     * Show the output
     */
     protected output(datum: Datum) {
        console.log("output called")
        if (!this.playing) return
        super.output(datum)
 this._utterance.text = datum.value.toString()
 if(this._speechSynthesis.pending || this._speechSynthesis.speaking)
 this._speechSynthesis.cancel()
 this._speechSynthesis.speak(this._utterance)
     }
        
    

    // start speaking
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

    // pause the speech if it was playing
    public pause(): void {
        this._utterance.volume = 0;
        this._speechSynthesis.cancel();
        this.playing = false
        super.pause();
    }

    // resume the speech if it was paused
    public resume(): void {
     this.playing = true
     this._utterance.volume = this._volume;
this._speechSynthesis.resume();}

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