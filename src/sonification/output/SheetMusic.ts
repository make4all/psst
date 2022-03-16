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
        /* for immediately generating circle
        let curr = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        let cx = 260
        let cy = 155
        curr.setAttribute('cx', cx.toString())
        curr.setAttribute('cy', cy.toString())
        curr.setAttribute( 'r', '4');
        doc.documentElement.appendChild(curr)
        */
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
        console.log("number of datapoints", this.numSeq.length)
        console.log("number of sheets", this.numSheet)
        let cy = 155-14.16*2
        let baseCX = 114.9;
        const svg = document.getElementById('epic-svg')!
        let max : number;
        if (this.numSheet == 4) {
            max = 116;
        } else {
            max = 29;
        }
        console.log(max)
        for (let i = 0; i < this.numSeq.length && i < max * 2; i += 2) {
            if (i % 29 == 0 && i != 0) {
                console.log("entered at " + i.toString())
                baseCX += 145.1
                cy = 155-14.16*2
            }

            this.drawCircle({cx:(baseCX + this.numSeq[i]*7.1), 
                cy:cy += 14.16*2,
                r:4,
                id:i},svg); 

            //get svg source.
            var serializer = new XMLSerializer();
            var source = serializer.serializeToString(svg);

            //add name spaces.
            if(!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)){
                source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
            }
            if(!source.match(/^<svg[^>]+"http\:\/\/www\.w3\.org\/1999\/xlink"/)){
                source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
            }

            //add xml declaration
            source = '<?xml version="1.0" standalone="no"?>\r\n' + source;

            //convert svg source to URI data scheme.
            var url = "data:image/svg+xml;charset=utf-8,"+encodeURIComponent(source);

            //set url value to a element's href attribute.
            let link : HTMLAnchorElement;
            link = document.querySelector("a#link")!
            link.href = url;
            //you can download svg file by right click menu.
            console.log(i)
        }
    }

    drawCircle(o, parent) {
        var circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        for (var name in o) {
            if (o.hasOwnProperty(name)) {
                circle.setAttributeNS(null, name, o[name]);
            }
        }
        parent.appendChild(circle);
        return circle;
    }

    // scale the provided num to a value in the range
    public convertToNote(num : number) : number {
        let note = (num - this.domain[0].value) * (this.range[1].value - this.range[0].value) / (this.domain[1].value - this.domain[0].value) + this.range[0].value;
        // if (note == NaN || note == undefined) note = this.range[1].value
        return note;
    }
}