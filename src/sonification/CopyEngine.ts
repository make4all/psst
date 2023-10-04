import { Datum } from './Datum'
import { getSonificationLoggingLevel, OutputStateChange, SonificationLoggingLevel } from './OutputConstants'
import { DataSink } from './DataSink'
import { BehaviorSubject, distinctUntilChanged, map, merge, Observable, shareReplay, tap } from 'rxjs'
import assert from 'assert'
import { create } from 'rxjs-spy'

const DEBUG = false

export class CopyEngine {
    /**
     * The Output Engine. Enforce that there is only ever one.
     * @todo ask group if there is a better way to enforce this.
     */
    private static copyEngineInstance: CopyEngine
    private copiedDataMap: Map<String, Datum[]> = new Map()

    public setCopiedData(key: String | undefined, data: Datum[]) {
        if (key !== undefined) {
            if (this.copiedDataMap.has(key)) {
                const existingArray = this.copiedDataMap.get(key)
                if (existingArray) {
                    existingArray.push(...data)
                }
            } else {
                this.copiedDataMap.set(key, data)
            }
        } else {
            // Handle the case where SinkName is undefined
            console.error('getSinkName() returned undefined')
        }
    }

    public printCopiedData(): void {
        console.log(this.copiedDataMap)
    }

    /**
     * Create a new CopyEngine. Enforces that there is only ever one
     * @returns The CopyEngine's instance..
     */
    public static getInstance(): CopyEngine {
        if (!CopyEngine.copyEngineInstance) {
            CopyEngine.copyEngineInstance = new CopyEngine()
        }

        return CopyEngine.copyEngineInstance
    }
}
