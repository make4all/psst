import { DataHandler } from './DataHandler'
import { DataSink } from '../DataSink'
import { Datum } from '../Datum'
import { DatumOutput } from '../output/DatumOutput'
import { Observable, filter } from 'rxjs'
import { getSonificationLoggingLevel, OutputStateChange, SonificationLoggingLevel } from '../OutputConstants'
import { tap } from 'rxjs/operators'

const DEBUG = false

export class CopyToClipboardHandler extends DataHandler {
    private copiedData: Datum[] = []

    private _domain: [number, number]
    public get domain(): [number, number] {
        return this._domain
    }
    public set domain(value: [number, number]) {
        this._domain = value
    }

    public insideDomain(num: number): boolean {
        debugStatic(SonificationLoggingLevel.DEBUG, `checking if ${num} is inside ${this.domain}`)
        return num >= this.domain[0] && num <= this.domain[1]
    }

    constructor(domain?: [number, number], output?: DatumOutput) {
        super(output)
        debugStatic(SonificationLoggingLevel.DEBUG, 'setting up Copy handler')
        if (domain) {
            debugStatic(SonificationLoggingLevel.DEBUG, `setting up copy range handeler with domain ${domain}`)
            this._domain = domain
        } else this._domain = [0, 0]
    }

    /**
     * Set up a subscription to copy the incoming data
     *
     * @param sink$ The sink that is producing data for us
     */
    public setupSubscription(sink$: Observable<OutputStateChange | Datum>) {
        super.setupSubscription(
            sink$.pipe(
                tap((data) => {
                    if (data instanceof Datum) {
                        if (this.insideDomain(data.value)) this.copiedData.push(data)
                    }
                }),
            ),
        )
    }

    /**
     * Get the copied data
     *
     * @returns The copied data
     */
    public getCopiedData(): Datum[] {
        return this.copiedData
    }

    /**
     * Copies the data in the copiedData array as CSV to the clipboard
     */
    public copyToClipboard() {
        if (this.copiedData.length === 0) {
            console.log('No data available to copy')
            return
        }

        const headings = Object.keys(this.copiedData[0])
        const csvData = [headings.join(',')]
            .concat(this.copiedData.map((datum) => Object.values(datum).join(',')))
            .join('\n')

        navigator.clipboard.writeText(csvData).then(() => {
            console.log('Data copied to clipboard')
        })
    }

    /**
     * Clear the copied data
     */
    public clearCopiedData() {
        this.copiedData = []
    }

    complete(): void {
        this.copyToClipboard()
        this.clearCopiedData()
        super.complete()
    }

    public toString(): string {
        return `CopyRangeHandler: Keeping only data in ${this.domain[0]},${this.domain[1]}`
    }
}

//////////// DEBUGGING //////////////////
import { tag } from 'rxjs-spy/operators/tag'
const debug = (level: number, message: string, watch: boolean) => (source: Observable<any>) => {
    if (watch) {
        return source.pipe(
            tap((val) => {
                debugStatic(level, message + ': ' + val)
            }),
            tag(message),
        )
    } else {
        return source.pipe(
            tap((val) => {
                debugStatic(level, message + ': ' + val)
            }),
        )
    }
}

const debugStatic = (level: number, message: string) => {
    if (DEBUG) {
        if (level >= getSonificationLoggingLevel()) {
            console.log(message)
        } // else console.log('debug message dumped')
    }
}
