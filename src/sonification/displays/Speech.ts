import { Datum } from '../Datum'
import { DisplayState } from '../SonificationConstants';
import { DatumDisplay } from './DatumDisplay'
const DEBUG = true;
export class Speech extends DatumDisplay {
    private _speechSynthesis : SpeechSynthesis
    private _utterance : SpeechSynthesisUtterance
    private _volume:number; 

    // construct the utterance and set its properties
    public constructor(lang?: string, volume?: number, rate?: number, voice?: SpeechSynthesisVoice) {
        super()
        if(DEBUG) console.log("in constructor of speech synthesis")
        this._speechSynthesis = window.speechSynthesis;
        if(DEBUG) console.log("speech synthesis pause status",this._speechSynthesis.paused)
        if(this._speechSynthesis && DEBUG) console.log("speech synthesis initialized.")
        this._utterance = new SpeechSynthesisUtterance()
        this._utterance.rate = rate? rate : 7 // rate is 0.1-10
        this._volume = volume? volume : 1 // volume is 0-1
        if (lang) this._utterance.lang = lang
        if (voice) this._utterance.voice = voice
        else{
            this._utterance.voice = this._speechSynthesis.getVoices()[0];
        }
        if(DEBUG) console.log("returning from speech constructor")
    }

    // update the datum being used
    public update(datum?: Datum) {
        if (this.displayState == DisplayState.Paused || this.displayState == DisplayState.Stopped) return
        super.update(datum)
        
        if (datum) this._utterance.text = datum.value.toString()
        this.start()
    }

    // start speaking
    public start(): void {
        this._utterance.volume = this._volume;
        this._speechSynthesis.resume(); // always resume before speaking. There is a bug on Web Speech that if you pause for more than 15 seconds, speech fails quietly.
        if(DEBUG) console.log("speaking utterance ",this._utterance)
        if(DEBUG) console.log("speech synthesis status",this._speechSynthesis.paused)
        // stop any future utterances
        if (this._speechSynthesis.pending) {
            this._speechSynthesis.cancel();
        }
        // start current utterance
        this._speechSynthesis.speak(this._utterance)
       super.start(); 
    }

    // pause the speech if it was playing
    public pause(): void {
        this._utterance.volume = 0;
        super.pause();

        // if (this._speechSynthesis.speaking) {
        //     this._speechSynthesis.pause();
        // }
    }

    // resume the speech if it was paused
    public stop(): void {
        if (this._speechSynthesis.pending) {
            this._speechSynthesis.cancel();
        }
    }

    public toString() : string {
        return `Speech`
    }
}