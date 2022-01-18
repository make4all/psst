import { Datum } from "../Datum";
import { Sonify } from "./Sonify";
import { Sonifier } from '../Sonifier';

/**
 * Class for sonifying a data point as a pitch.
 * @extends Sonify
 *
 * @field smooth: Should the note smoothly transition from the pitch of the previous data point?
 *
 * [note may want to think about whether supporting cohices for different animations besides linearRampToValueAtTime]
 * [note implementation not complete. Needs to handle scheduleSound still]
 */
export class NoteSonify extends Sonify {
    /**
     * The start and end frequency for the note to play
     */
    private frequency: number | undefined;

    public getAudioNode(sonifier?: Sonifier) {
        console.log("get audio node called")
        if (super.getAudioNode()) return super.getAudioNode();
        if (sonifier) {
            console.log("created audio node")
            let oscillator = sonifier.audioCtx.createOscillator();
            super.setAudioNode(oscillator);
        }
        return super.getAudioNode();
    }

    /**
     * Stores relevant information when a new datum arrives
     * @param datum The data datum to be sonified
     * @param duration The length of time over which to change to the new pitch. Defaults to 10 ms
     * @param volume The volume to play the note at. Can be overriden globally
     * @param smooth Whether to connect the notes in the sequence being played. If undefined, defaults to true.
     */
    public update(datum: Datum, duration = 200, volume?: number, smooth?: boolean) {
        super.update(datum);
        console.log(`updating value  ${this.frequency}`)
        let oscillator = this.getAudioNode() as OscillatorNode;
        if (this.frequency == undefined) {
            // first data point
            oscillator.frequency.value = datum.adjustedValue;
            this.frequency = datum.adjustedValue;
            oscillator.start()
        } else {
            oscillator.frequency.value = datum.adjustedValue;
            this.frequency = datum.adjustedValue;
        }
    }


    /**
     * Generates a new note sonifier
     * @param duration The length of time the sound should play for
     * @param volume The volume the sound should play at
     * @param optionally include an audio node that can be played
     * @param smooth optionall specify if sounds should transition smoothly between data points
     * @returns Returns an instance of specific subclass of SonificationType.
     */
    public constructor(volume?: number, audioNode?: AudioScheduledSourceNode) {
        super(volume, audioNode);
    }


    public toString(): string {
        //let oscillator = this.getAudioNode() as OscillatorNode;
        return `NoteSonify`;
    }
}
