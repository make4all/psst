import { Datum } from '../Datum'
import { Note, FourMusicSheet, SingleMusicSheet } from '../OutputConstants'
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
    // the current sequence of notes indicated by number
    private numSeq : number[]
    // either one sheet or four sheet
    private numSheet : number

    constructor(domain? : [number, number], numSheet?) {
        super()
        if (domain) {
            this.domain = [new Statistic(domain[0]), new Statistic(domain[1])]
        } else {
            // ask what a valid default domain
            this.domain = [new Statistic(-10), new Statistic(10)]
        }
        if (numSheet) {
            this.numSheet = numSheet;
        } else {
            this.numSheet = 1;
        }
        this.noteSeq = []
        this.numSeq = []
        this.range = [new Statistic(0), new Statistic(14)]
        let svg : string;
        if (this.numSheet == 4) {
            svg = FourMusicSheet();
        } else {
            svg = SingleMusicSheet();
        }
        const parser = new DOMParser();
        // parsed svg into a document, can now append to document
        const doc = parser.parseFromString(svg, "image/svg+xml")
        const myElement = document.getElementById('for-svg')!
        doc.documentElement.id = 'epic-svg'
        if (doc && myElement) {
            myElement.appendChild(doc.documentElement)
        }
    }

    protected output(datum: Datum): void {
        // convert value to closest note and add to list of values seen
        let idx : number = Math.round(this.convertToNote(datum.value))
        let note : string = Note[idx]
        this.numSeq.push(idx)
        this.noteSeq.push(note)
    }

    // why is stop being called twice?
    protected stop(): void {
        super.stop()
        let cy = 155-14.16*2
        const svg = document.getElementById('epic-svg')!
        let max : number;
        if (this.numSheet == 1) {
            max = 32;
        } else {
            max = 128;
        }
        for (let i = 0; i < this.numSeq.length && i < max; i++) {
            let curr = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            let cx = 114.9 + this.numSeq[i*2]*7.1
            cy += 14.16*2
            curr.setAttribute('cx', cx.toString())
            curr.setAttribute('cy', cy.toString())
            curr.setAttribute( 'r', '4');
            svg.appendChild(curr)
        }
    }

    // scale the provided num to a value in the range
    public convertToNote(num : number) : number {
        let note = (num - this.domain[0].value) * (this.range[1].value - this.range[0].value) / (this.domain[1].value - this.domain[0].value) + this.range[0].value;
        // if (note == NaN || note == undefined) note = this.range[1].value
        return note;
    }
}