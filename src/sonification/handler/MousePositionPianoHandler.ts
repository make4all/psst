import { DatumOutput } from '../output/DatumOutput'
import { getPianoKeys } from '../OutputConstants'
import { ScaleHandler } from './ScaleHandler'
/**
 * A DataHandler that outputs a Datum as a note in the audible range.
 * Assumes a note should be played in the general range of 80 to 500 Hz to sound nice
 */
export class MousePositionPianoHandler extends ScaleHandler {
    /**
     * Sets up a default target range that is audible. Uses the Mel Scale (https://www.wikiwand.com/en/Mel_scale)
     * @param sink. DataSink that is providing data to this Handler.
     * @param targetRange The audible range the note should be in
     * @param volume How loudly to play the note.
     */

    constructor(domain?: [number, number], output?: DatumOutput) {
        super(MousePositionPianoHandler.pianoConversion, domain, [80, 450], output)
    }

    public static pianoConversion(num, domain, range): number {
        console.log(`domain is${domain}, number is ${num}` )
        var pianoKeys = getPianoKeys()
        var numberOfKeys = pianoKeys.size;
        // console.log(`number of keys is ${numberOfKeys}`)
        var step:number = domain[1]-domain[0]/numberOfKeys
        console.log(`step for mapping mouse to piano is${step} `)
        var buckets:number[] = [];
        var notes:number[] = [];
        for(var i=0;i<numberOfKeys;i++)
        {
            buckets.push(i*(step/numberOfKeys))
        }
        // console.log(`buckets are ${buckets}`)
        for(let [key, value] of pianoKeys){
            notes.push(pianoKeys.get(key)![0])
        }
        // console.log(`notes are ${notes}`)
        for(var i=0;i<buckets.length-1;i++) {
            if(buckets[i] <= num && num <= buckets[i+1] ){
                
                console.log(` found match for num ${num}. returning note ${notes[i]} at index ${i}`)
                return notes[i]
            }
            
        }
        return notes[0]

        }

    public toString(): string {
        return `MousePositionKeyboardHandler: Converting using Mel from ${this.domain[0]}, ${this.domain[1]} to ${this.range[0]},${this.range[1]}`
    }
}
