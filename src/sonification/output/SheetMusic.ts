import { Datum } from '../Datum'
import { Note, MusicSheet } from '../OutputConstants'
import { DatumOutput } from './DatumOutput'
import { Statistic } from '../stat/Statistic';

const DEBUG = false;

/**
 * Class used to create sheet music for a music box by converting data points into notes.
 */
export class SheetMusic extends DatumOutput {

    // choose to either save last or first

    // the range of values expected
    private domain : [Statistic, Statistic]
    // the range of values to be outputted
    private range : [Statistic, Statistic]
    // the current sequence of notes
    private sheet : string[]

    constructor(domain? : [number, number]) {
        super()
        if (domain) {
            this.domain = [new Statistic(domain[0]), new Statistic(domain[1])]
        } else {
            // ask what a valid default domain
            this.domain = [new Statistic(-10), new Statistic(10)]
        }
        this.sheet = []
        this.range = [new Statistic(0), new Statistic(14)]
        let svg = MusicSheet();
        const parser = new DOMParser();
        // parsed svg into a document, can now append to document
        const doc = parser.parseFromString(svg, "image/svg+xml")
        console.log("parsed svg", doc)
        // spot in doc to place SVG
        const forSVG = document.getElementById('for-svg')!
        if (doc && forSVG) {
            var svgElem = doc.querySelector('svg')!
            var circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute( 'cx', '122' );
            circle.setAttribute( 'cy', '169' );
            circle.setAttribute( 'r', '3' );
            svgElem.appendChild(circle)
            forSVG.appendChild(doc.documentElement)
        }
    }

    protected output(datum: Datum): void {
        // convert value to closest note and add to list of values seen
        let idx : number = Math.round(this.convertToNote(datum.value))
        let note : string = Note[idx]
        this.sheet.push(note)
        console.log(this.sheet.toString())
    }

    // scale the provided num to a value in the range
    public convertToNote(num : number) : number {
        let note = (num - this.domain[0].value) * (this.range[1].value - this.range[0].value) / (this.domain[1].value - this.domain[0].value) + this.range[0].value;
        // if (note == NaN || note == undefined) note = this.range[1].value
        return note;
    }
}