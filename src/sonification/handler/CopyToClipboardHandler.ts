import { DataHandler } from './DataHandler'
import { DataSink } from '../DataSink'
import { Datum } from '../Datum'
import { DatumOutput } from '../output/DatumOutput'
import { OutputStateChange } from '../OutputConstants'
import { Observable, filter } from 'rxjs'
import { tap } from 'rxjs/operators'

export class CopyToClipboardHandler extends DataHandler {
    private copiedData: Datum[] = []

    constructor(output?: DatumOutput) {
        super(output)
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
                        this.copiedData.push(data)
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
        return `CopyToClipboardHandler`
    }
}
