import { Datum } from '../Datum'
import { DatumDisplay } from './DatumDisplay'

export class Speech extends DatumDisplay {
    private _speechSynthesis : SpeechSynthesis
    private _utterance : SpeechSynthesisUtterance

    // construct the utterance and set its properties
    public constructor(lang?: string, volume?: number, rate?: number, voice?: SpeechSynthesisVoice) {
        super()
        this._speechSynthesis = window.speechSynthesis;
        this._utterance = new SpeechSynthesisUtterance()
        this._utterance.rate = rate? rate : 7 // rate is 0.1-10
        this._utterance.volume = volume? volume : 1 // volume is 0-1
        if (lang) this._utterance.lang = lang
        if (voice) this._utterance.voice = voice
    }

    // update the datum being used
    public update(datum?: Datum) {
        super.update(datum)
        if (datum) this._utterance.text = datum.value.toString()
        this.show()
    }

    // start speaking
    public show(): void {
        // stop any future utterances
        /*if (this._speechSynthesis.pending) {
            this._speechSynthesis.cancel();
        }*/
        // start current utterance
        this._speechSynthesis.speak(this._utterance)
    }

    // pause the speech if it was playing
    public pause(): void {
        if (this._speechSynthesis.speaking) {
            this._speechSynthesis.pause();
        }
    }

    // resume the speech if it was paused
    public resume(): void {
        if (this._speechSynthesis.paused) {
            this._speechSynthesis.resume();
        }
    }

    public toString() : string {
        return `Speech`
    }
}