import { tap, Observable } from 'rxjs'
import { Datum } from '../Datum'
import { getSonificationLoggingLevel, SonificationLoggingLevel } from '../OutputConstants'
import { Sonify } from './Sonify'
import { SonifyFixedDuration } from './SonifyFixedDuration'

const DEBUG = false

/**
 * Class for sonifying a data point as a pitch.
 * @extends Sonify
 * @todo only plays noise once. investigate further. probably have to create new noise nodes for each point.
 */
export class NoiseSonify extends SonifyFixedDuration {
    /**
     * This is the node that knows how to play noise. It is connected to the this.audioNode
     */
    private filter: BiquadFilterNode | undefined

    protected extend(timeAdd: number) {
        let noiseNode = this.outputNode as AudioBufferSourceNode
        debugStatic(SonificationLoggingLevel.DEBUG, `noiseSonify, getting noise node ${noiseNode}`)
        if (noiseNode) noiseNode.buffer = this.fillBuffer(timeAdd)
    }

    /**
     * create a buffer and fill it
     * @param time Time to fill it for in seconds
     */
    private fillBuffer(length: number): AudioBuffer {
        let sampleRate = Sonify.audioCtx.sampleRate
        let noiseBufferSize = sampleRate * length
        let buffer = NoiseSonify.audioCtx.createBuffer(1, noiseBufferSize, NoiseSonify.audioCtx.sampleRate)
        let bufferData = buffer.getChannelData(0)
        console.log('filling in buffer data')
        for (let i = 0; i < noiseBufferSize; i++) {
            bufferData[i] = Math.random() * 2 - 1
        }
        return buffer
    }

    public create(datum: Datum): AudioScheduledSourceNode {
        let outputNode = NoiseSonify.audioCtx.createBufferSource()
        this.filter = NoiseSonify.audioCtx.createBiquadFilter()
        this.filter.type = 'bandpass'
        this.filter.frequency.value = 440
        this.filter.connect(this.gainNode)

        outputNode.buffer = this.fillBuffer(this.duration)
        outputNode.connect(this.filter)
        this.outputNode = outputNode
        outputNode.start()
        return outputNode
    }

    public toString(): string {
        return `NoiseSonify`
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
        } else console.log('debug message dumped')
    }
}
