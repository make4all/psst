import { Datum } from '../Datum'
import { DatumDisplay } from './DatumDisplay'

export class Speech extends DatumDisplay {
    private _speechSynthesis : SpeechSynthesis
    private _utterance : SpeechSynthesisUtterance

    // construct the utterance and set its properties
    public constructor(lang?: string, volume?: number, voice?: SpeechSynthesisVoice) {
        super()
        this._utterance = new SpeechSynthesisUtterance()
        this._utterance.lang = lang
        this._utterance.volume = volume
        this._utterance.voice = voice
    }

    // update the datum being used
    public update(datum: Datum) {
        super.update(datum)
        this._utterance.text = datum.toString();
    }

    // start speaking
    public show(): void {
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
}