import { Datum } from '../Datum'
import { SonifyFixedDuration } from './SonifyFixedDuration'

/**
 * Class for sonifying a data point using an array buffer.
 * @extends SonifyFixedDuration
 */
export class FileOutput extends SonifyFixedDuration {
    private _buffer: ArrayBuffer | undefined

    constructor(buffer?: ArrayBuffer) {
        super()
        if (buffer) {
            this._buffer = buffer
        }
    }

    public get buffer(): ArrayBuffer | undefined {
        return this._buffer
    }

    public set buffer(value: ArrayBuffer | undefined) {
        this._buffer = value
    }

    // Create the buffer source and start it playing.
    protected create(datum: Datum): AudioScheduledSourceNode {
        console.log('playing for datum', datum.value)
        const source = FileOutput.audioCtx.createBufferSource()
        if (this._buffer) {
            FileOutput.audioCtx.decodeAudioData(this._buffer.slice(0), (buffer) => (source.buffer = buffer))
            this.outputNode = source
            this.outputNode.connect(this.gainNode)
            source.start()
        }
        if (source.buffer) this.duration = source.buffer.duration
        return source
    }

    protected extend(timeAdd: number) {
        throw new Error('Method not implemented.')
    }
}
