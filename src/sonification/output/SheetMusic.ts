import { Datum } from '../Datum'
import { Note, FourMusicSheet } from '../OutputConstants'
import { DatumOutput } from './DatumOutput'
import { Statistic } from '../stat/Statistic';

const DEBUG = false;

/**
 * Class used to create sheet music for a music box by converting data points into notes.
 */
export class SheetMusic extends DatumOutput {

    // the range of values expected
    private domain : [Statistic, Statistic]
    // the range of values to be outputted
    private range : [Statistic, Statistic]
    // the current sequence of notes
    private noteSeq : string[]
    private numSeq : number[]

    constructor(domain? : [number, number]) {
        super()
        if (domain) {
            this.domain = [new Statistic(domain[0]), new Statistic(domain[1])]
        } else {
            // ask what a valid default domain
            this.domain = [new Statistic(-10), new Statistic(10)]
        }
        this.noteSeq = []
        this.numSeq = []
        this.range = [new Statistic(0), new Statistic(14)]
        let svg = FourMusicSheet();
        const parser = new DOMParser();
        // parsed svg into a document, can now append to document
        const doc = parser.parseFromString(svg, "image/svg+xml")
        const myElement = document.getElementById('for-svg')!
        doc.documentElement.id = 'epic-svg'
        if (doc && myElement) {
            //doc.documentElement.appendChild(circle)
            myElement.appendChild(doc.documentElement)
        }
    }

    protected output(datum: Datum): void {
        // try loading in file here?

        // convert value to closest note and add to list of values seen
        let idx : number = Math.round(this.convertToNote(datum.value))
        let note : string = Note[idx]
        this.numSeq.push(idx)
        this.noteSeq.push(note)
        //console.log(this.noteSeq.toString())
    }

    // why is stop being called twice?
    protected stop(): void {
        console.log("stopped")
        console.log("numSeq at end", this.numSeq.toString())
        super.stop()
        let cy = 155
        const svg = document.getElementById('epic-svg')!
        console.log("is this happening?")
        for (let i = 0; i < this.numSeq.length && i < 128; i++) {
            console.log("in loop")
            let curr = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            let cx = 114.9 + this.numSeq[i*2]*7.1
            cy += 14.16*2
            curr.setAttribute('cx', cx.toString())
            curr.setAttribute('cy', cy.toString())
            curr.setAttribute( 'r', '4');
            svg.appendChild(curr)
        }
        console.log("did it")
    }

    // scale the provided num to a value in the range
    public convertToNote(num : number) : number {
        let note = (num - this.domain[0].value) * (this.range[1].value - this.range[0].value) / (this.domain[1].value - this.domain[0].value) + this.range[0].value;
        // if (note == NaN || note == undefined) note = this.range[1].value
        return note;
    }
}