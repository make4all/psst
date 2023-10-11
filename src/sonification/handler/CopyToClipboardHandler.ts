import { DataHandler } from './DataHandler'
import { DataSink } from '../DataSink'
import { Datum } from '../Datum'
import { DatumOutput } from '../output/DatumOutput'
import { OutputStateChange } from '../OutputConstants'
import { Observable, filter } from 'rxjs'
import { tap } from 'rxjs/operators'
import { OutputEngine } from '../OutputEngine'

export class CopyToClipboardHandler extends DataHandler {
    private sinkId: number | undefined = undefined

    constructor(output?: DatumOutput) {
        super(output)
    }

    /**
     * Set up a subscription to copy the incoming data
     *
     * @param sink$ The sink that is producing data for us
     */

    public setupSubscription(sink$: Observable<OutputStateChange | Datum>) {
        console.log(this)
        super.setupSubscription(
            sink$.pipe(
                tap((data) => {
                    if (data instanceof Datum) {
                        this.sinkId = data.sinkId
                        const copiedDataMap = OutputEngine.getInstance().getCopiedDataMap()
                        if (copiedDataMap.has(this.sinkId)) {
                            // Push the value to the array
                            copiedDataMap.get(this.sinkId)?.push(data)
                        } else {
                            // If the array doesn't exist, create a new array with the value
                            copiedDataMap.set(this.sinkId, [data])
                        }
                    }
                }),
            ),
        )
    }

    /**
     * Copies the data in the copiedData array as CSV to the clipboard
     */
    public copyToClipboard() {
        OutputEngine.getInstance().printCopyMap()
        OutputEngine.getInstance().copyToClipboard()
    }

    complete(): void {
        console.log('Sink Id', this.sinkId)
        if (this.sinkId !== undefined) {
            OutputEngine.getInstance().eraseCopiedData(this.sinkId)
        }

        super.complete()
    }

    public toString(): string {
        return `CopyToClipboardHandler`
    }
}
