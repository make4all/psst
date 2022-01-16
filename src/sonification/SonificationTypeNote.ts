import { Point } from './SonificationUtils';
import { SonificationType } from "./SonificationType";
import { Sonifier } from './sonifier';
import { start } from 'repl';

/**
 * Class for sonifying a data point as a pitch.
 * @extends SonificationType
 *
 * @field length: The length of time this note should be played for (in ms)
 * @field pitch: The frequency that should be used for the note (in hertz)
 * @constructor Stores the provided value, volume and length
 * @makeOutput Decides what pitch to assign, and provides a default volume and length
 *
 * [note may want to think about whether supporting cohices for different animations besides linearRampToValueAtTime]
 * [note implementation not complete. Needs to handle scheduleSound still]
 */
export class NoteSonificationType extends SonificationType {

    /**
    * The pitch of the note to be played
    */
    private _frequency: number = 0;
    public get frequency(): number {
        return this._frequency;
    }
    public set frequency(value: number) {
        this._frequency = value;
    }


    /**
     * @constructor Stores relevant information.
     * @param point The data point to be sonified
     * @param oscillator An oscillator for generating sound
     * @param volume The volume to play the note at. Can be overriden globally
     * @param duration The length of time for which to play the note 
     * @param smooth Whether to connect the notes in the sequence being played. 
     */
    constructor(point: Point, oscillator: OscillatorNode, volume = 1, duration = 10, smooth?:boolean) {
        super(point, oscillator, duration, volume);
        this.frequency = point.scaledValue;
        if (smooth) {
            oscillator.frequency.value = point.previous.scaledValue;
            oscillator.frequency.linearRampToValueAtTime(this.frequency, duration);
        }   
    };

    /**
     * @override abstract method in superclass
     * @param point The point being sonified
     * @returns SonificationNote
     */
    public makeOutput(point: Point, sonifier: Sonifier, volume?:number, duration?:number, smooth?:boolean): SonificationType {
        let oscillator = sonifier.audioCtx.createOscillator()
        oscillator.onended = () => sonifier.handelOnEnded()
        oscillator.connect(sonifier.audioCtx.destination)
        return new NoteSonificationType(point, oscillator, volume, duration, smooth);
    }
}
