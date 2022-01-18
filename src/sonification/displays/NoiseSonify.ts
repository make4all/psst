    import { Datum } from '../Datum';
    import { Sonifier } from '../Sonifier';
    import { Sonify } from "./Sonify";

    /**
     * Class for sonifying a data point as a pitch.
     * @extends Sonify
     *
     */
    export class NoiseSonify extends Sonify {

    private noiseBufferSize = 20;
    private duration = 10;

    public getAudioNode(sonifier?: Sonifier) {
        if (super.getAudioNode()) return super.getAudioNode();
        if (sonifier) {
            let sampleRate = sonifier.audioCtx.sampleRate;
            this.noiseBufferSize = sampleRate * this.duration
            let buffer = sonifier.audioCtx.createBuffer(1, this.noiseBufferSize, sonifier.audioCtx.sampleRate)
            let noiseNode = sonifier.audioCtx.createBufferSource()
            noiseNode.buffer = buffer
            let bandPassFilterNode = sonifier.audioCtx.createBiquadFilter()
            bandPassFilterNode.type = 'bandpass'
            bandPassFilterNode.frequency.value = 440
            noiseNode.connect(bandPassFilterNode)
            this.setAudioNode(bandPassFilterNode);
        }
        return super.getAudioNode();
    }

    public update(datum: Datum, duration?: number) {
        super.update(datum);
        if (duration) this.duration = duration;
        let noiseNode = this.getAudioNode() as AudioBufferSourceNode;
        let buffer = noiseNode.buffer;
        if (buffer) {
            let bufferData = buffer.getChannelData(0)
            for (let i = 0; i < this.noiseBufferSize; i++) {
                bufferData[i] = Math.random() * 2 - 1
            }
        }
    }
        
    public toString(): string {
        return `NoiseSonify`
    }
}