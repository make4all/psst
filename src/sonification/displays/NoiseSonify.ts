import { Datum } from '../Datum'
import { Sonifier } from '../Sonifier'
import { Sonify } from './Sonify'

/**
 * Class for sonifying a data point as a pitch.
 * @extends Sonify
 * @todo only plays noise once. investigate further. probably have to create new noise nodes for each point.
 *
 */
export class NoiseSonify extends Sonify {
    /**
     * @todo what do we do when this is live data? unlike audio nodes, noise nodes need a duration to calculate the buffer length.
     */

    private noiseBufferSize = 20
    private duration = 0.1

    public getAudioNode(sonifier?: Sonifier) {
        console.log('NoiseSonify:getAudioNode')
        if (super.getAudioNode()) return super.getAudioNode()
        if (sonifier) {
            console.log('executing code in getAudioNode')
            let sampleRate = sonifier.audioCtx.sampleRate
            this.noiseBufferSize = sampleRate * this.duration
            let buffer = sonifier.audioCtx.createBuffer(1, this.noiseBufferSize, sonifier.audioCtx.sampleRate)
            let noiseNode = sonifier.audioCtx.createBufferSource()
            noiseNode.buffer = buffer
            let bandPassFilterNode = sonifier.audioCtx.createBiquadFilter()
            bandPassFilterNode.type = 'bandpass'
            bandPassFilterNode.frequency.value = 440
            noiseNode.connect(bandPassFilterNode)
            this.setAudioNode(noiseNode)
        }
        return super.getAudioNode()
    }

    public update(datum: Datum, duration?: number) {
        console.log('NoiseSonify: updateDatum')
        super.update(datum)
        if (duration) this.duration = duration
        let noiseNode = this.getAudioNode() as AudioBufferSourceNode
        console.log('noiseSonify, getting noise node', noiseNode)
        let buffer = noiseNode.buffer
        if (buffer) {
            let bufferData = buffer.getChannelData(0)
            console.log('filling in buffer data')
            for (let i = 0; i < this.noiseBufferSize; i++) {
                bufferData[i] = Math.random() * 2 - 1
            }
            noiseNode.start()
        }
    }

    public toString(): string {
        return `NoiseSonify`
    }
}
