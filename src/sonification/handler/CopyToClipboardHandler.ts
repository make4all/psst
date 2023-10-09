import { DataHandler } from './DataHandler'
import { DataSink } from '../DataSink'
import { Datum } from '../Datum'
import { DatumOutput } from '../output/DatumOutput'
import { OutputStateChange } from '../OutputConstants'
import { Observable, filter } from 'rxjs'
import { tap } from 'rxjs/operators'
import { OutputEngine } from '../OutputEngine'

interface DataRow {
    values: number[]
    timestamp: number
}

export class CopyToClipboardHandler extends DataHandler {
    private copiedData: Datum[] = []

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
                        const sinkId = data.sinkId
                        const copiedDataMap = OutputEngine.getInstance().getCopiedDataMap()
                        if (copiedDataMap.has(sinkId)) {
                            // Push the value to the array
                            copiedDataMap.get(sinkId)?.push(data)
                        } else {
                            // If the array doesn't exist, create a new array with the value
                            copiedDataMap.set(sinkId, [data])
                        }
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

    public convertToCSVAndCopy(data): void {
        // Convert the array of DataRow objects to a CSV string
        const csv = data.map((row) => `${row.timestamp},${row.values.join(',')}`).join('\n')

        // Use the Clipboard API to copy the CSV string to the clipboard
        navigator.clipboard
            .writeText(csv)
            .then(() => {
                console.log('CSV data copied to clipboard')
            })
            .catch((error) => {
                console.error('Failed to copy CSV data to clipboard:', error)
            })
    }

    private combineStreams(streams: Datum[][]): DataRow[] {
        const n = streams.length
        const pointers = Array(n).fill(0)
        const result: DataRow[] = []

        while (true) {
            let minTimestamp = Number.MAX_SAFE_INTEGER
            let minStreamIndex = -1

            // Find the minimum timestamp among the streams
            for (let i = 0; i < n; ++i) {
                if (pointers[i] < streams[i].length && streams[i][pointers[i]].time < minTimestamp) {
                    minTimestamp = streams[i][pointers[i]].time
                    minStreamIndex = i
                }
            }

            // Check if all streams are exhausted
            if (minStreamIndex === -1) {
                break
            }

            let timestampsMatch = true

            // Check if timestamps are the same for all streams

            for (let i = 0; i < n; i++) {
                while (pointers[i] < streams[i].length && streams[i][pointers[i]].time < minTimestamp) {
                    pointers[i]++
                }
            }

            for (let i = 0; i < n; ++i) {
                if (pointers[i] < streams[i].length && streams[i][pointers[i]].time !== minTimestamp) {
                    timestampsMatch = false
                    break
                }
            }

            if (timestampsMatch) {
                // Create a DataRow for this timestamp
                const row: DataRow = { values: Array(n).fill(0), timestamp: minTimestamp }

                // Fill in values for each parameter from the corresponding stream
                for (let i = 0; i < n; ++i) {
                    if (pointers[i] < streams[i].length && streams[i][pointers[i]].time === minTimestamp) {
                        row.values[i] = streams[i][pointers[i]].value
                        pointers[i]++
                    }
                }

                // Add the DataRow to the result
                result.push(row)
            } else {
                if (minStreamIndex !== -1) {
                    pointers[minStreamIndex]++
                } else {
                    break
                }
            }
        }

        return result
    }

    /**
     * Copies the data in the copiedData array as CSV to the clipboard
     */
    public copyToClipboard() {
        const copiedDataMap = OutputEngine.getInstance().getCopiedDataMap()

        const dataArray: Datum[][] = [...copiedDataMap.values()]

        const result = this.combineStreams(dataArray)

        this.convertToCSVAndCopy(result)

        // const headings = Object.keys(this.copiedData[0])
        // const csvData = [headings.join(',')]
        //     .concat(this.copiedData.map((datum) => Object.values(datum).join(',')))
        //     .join('\n')

        // navigator.clipboard.writeText(csvData).then(() => {
        //     console.log('Data copied to clipboard')
        // })
    }

    /**
     * Clear the copied data
     */
    public clearCopiedData() {
        this.copiedData = []
    }

    complete(): void {
        this.copyToClipboard()
        OutputEngine.getInstance().printCopiedData()
        if (this.sinkId !== undefined) {
            OutputEngine.getInstance().eraseCopiedData(this.sinkId)
        }
        this.clearCopiedData()
        super.complete()
    }

    public toString(): string {
        return `CopyToClipboardHandler`
    }
}
