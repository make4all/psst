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
        console.log("parsed svg", doc)
        const myElement = document.getElementById('for-svg')!
        let cx = 114.9
        let cy = 155
        for (let i = 0; i < 10; i++) {
            let curr = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            cx += 7.1
            cy += 14.16
            curr.setAttribute('cx', cx.toString())
            curr.setAttribute('cy', cy.toString())
            curr.setAttribute( 'r', '4');
            doc.documentElement.appendChild(curr)
        }
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
        console.log(this.noteSeq.toString())
    }

    // scale the provided num to a value in the range
    public convertToNote(num : number) : number {
        let note = (num - this.domain[0].value) * (this.range[1].value - this.range[0].value) / (this.domain[1].value - this.domain[0].value) + this.range[0].value;
        // if (note == NaN || note == undefined) note = this.range[1].value
        return note;
    }
}