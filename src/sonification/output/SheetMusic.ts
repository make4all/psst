import { Datum } from '../Datum'
import { Note, FourMusicSheet, SingleMusicSheet, ExtendedSingleSheet } from '../OutputConstants'
import { DatumOutput } from './DatumOutput'
import { Statistic } from '../stat/Statistic';
import { threadId } from 'worker_threads';

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
    private noteSeq : string[]
    // the current sequence of notes indicated by number
    private numSeq : number[]
    // the current sequence of data
    private dataSeq : number[]
    // whether the sheet will be laser cut or not
    private _cut : boolean
    public get cut(): boolean  {
        return this._cut
    }
    public set cut(value: boolean) {
        this._cut = value
    }
    // whether the music sheet can be continued after stopped
    private _canCont : boolean
    public get canCont() : boolean {
        return this._canCont
    }
    public set canCont(cont : boolean) {
        this._canCont = cont
    }

    constructor(lasercut : boolean, domain? : [number, number], cont? : boolean) {
        super()
        if (domain) {
            this.domain = [new Statistic(domain[0]), new Statistic(domain[1])]
        } else {
            // ask what a valid default domain
            this.domain = [new Statistic(-10), new Statistic(10)]
        }
        this.noteSeq = []
        this.numSeq = []
        this.dataSeq = []
        this.range = [new Statistic(0), new Statistic(14)]
        this._cut = lasercut
        if (cont != undefined) {
            this._canCont = cont
        } else {
            this._canCont = false
        }
    }

    private updateElement() : HTMLElement {
        const parser = new DOMParser();
        let svg : string = ExtendedSingleSheet();
        let doc;
        if (!this.cut) { // music sheet background
            doc = parser.parseFromString(svg, "image/svg+xml")
        } else { // plain background for ease when laser cutting
            doc = parser.parseFromString('<svg width="765" height="1700"><rect width="145" height="1700" x="90" style="stroke-width:1; stroke:black; fill: none;" /></svg>', "image/svg+xml")
        }
        return doc.documentElement
    }

    protected output(datum: Datum): void {
        this.dataSeq.push(datum.value)
    }

    // draws the first 68 points on an extended single sheet
    protected stop(): void {
        super.stop()
        if (this.dataSeq.length == 0) return
        // define min and max seen in live stream data
        this.domain = [new Statistic(Math.min(...this.dataSeq)), new Statistic(Math.max(...this.dataSeq))]
        // convert each point into a note (tracking note by string and by num representation)
        this.numSeq = this.dataSeq.map(x => Math.round(this.convertToNote(x)))
        this.noteSeq = this.numSeq.map(x => Note[x])
        let cy = 155-14.16*2
        let baseCX = 114.9;
        const svg = this.updateElement()
        let max : number = 53 // 29 for singleSheet, 58 for extendedSingle
        for (let i = 0; i < this.numSeq.length && i < max * 2; i += 2) {
            this.drawCircle({cx:(baseCX + this.numSeq[i]*7.1),
                cy:cy += 14.16*2,
                r:4,
                id:i},svg);
        }
        //get svg source.
        var serializer = new XMLSerializer();
        var source = serializer.serializeToString(svg);

        console.log(source)

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
        link = document.createElement('a')
        link.href = url
        link.style.display = 'none'
        link.download = "musicsheet.svg"
        document.body.appendChild(link)
        link.click()
        //you can download svg file by right click menu.
        if (!this.canCont) {
            this.dataSeq = []
            this.numSeq = []
            this.noteSeq = []
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