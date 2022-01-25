import { Datum } from '../Datum'
import { Sonifier } from '../Sonifier'
import { SonifyFixedDuration } from './SonifyFixedDuration'

const DEBUG = false;


/**
 * Class for sonifying a data point as a pitch.
 * @extends Sonify
 * @todo only plays noise once. investigate further. probably have to create new noise nodes for each point.
 *
 */
export class NoiseSonify extends SonifyFixedDuration {

    /**
     * This is the node that knows how to play noise. It is connected to the this.audioNode
     */
    private filter: BiquadFilterNode | undefined;

    protected extend(timeAdd: number) {
        let noiseNode = this.outputNode as AudioBufferSourceNode
        if (DEBUG) console.log('noiseSonify, getting noise node', noiseNode)
        if (noiseNode) noiseNode.buffer = this.fillBuffer(timeAdd);
    }

    /** 
     * The length of the buffer for making noise
     */
    private noiseBufferSize = 20
    /**
     * create a buffer and fill it
     * @param time Time to fill it for in seconds
     */
    private fillBuffer(length: number): AudioBuffer {
        let sampleRate = NoiseSonify.audioCtx.sampleRate
        let noiseBufferSize = sampleRate * length;
        let buffer = NoiseSonify.audioCtx.createBuffer(1, noiseBufferSize, NoiseSonify.audioCtx.sampleRate)
        let bufferData = buffer.getChannelData(0)
        console.log('filling in buffer data');
        for (let i = 0; i < noiseBufferSize; i++) {
            bufferData[i] = Math.random() * 2 - 1
        }
        return buffer;
    }
    
    public create(datum: Datum): AudioScheduledSourceNode {
        let outputNode = NoiseSonify.audioCtx.createBufferSource()
        this.filter = NoiseSonify.audioCtx.createBiquadFilter()
        this.filter.type = 'bandpass'
        this.filter.frequency.value = 440
        this.filter.connect(NoiseSonify.gainNode);

        outputNode.buffer = this.fillBuffer(this.duration);
        outputNode.connect(this.filter);
        this.outputNode = outputNode;
        outputNode.start();
        return outputNode;
    }
   
    public toString(): string {
        return `NoiseSonify`
    }
}
