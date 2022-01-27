import { Datum } from '../Datum'
import { Sonifier } from '../Sonifier'
import { Sonify } from './Sonify'

/**
 * Class for sonifying a data point as a pitch.
 * @extends Sonify
 * @todo only plays noise once. investigate further. probably have to create new noise nodes for each point.
 *
 */
export abstract class SonifyFixedDuration extends Sonify {
    /** duration in seconds */
    protected duration = .1

    /** StartTime is undefined if the node isn't playing */
    private startTime: number | undefined = undefined;
    
    constructor(volume?: number, audioNode?: AudioScheduledSourceNode, duration?: number) {
        super(volume, audioNode);
        if (duration) this.duration = duration;
    }

    protected set audioNode(value: AudioNode | undefined) {
        if (value as AudioScheduledSourceNode)
            this.audioNode = value;
        else throw new Error("Fixed duration nodes must be AudioScheduledSourceNode")
    }

    /**
     * Call extend if the audio node is still playing
     * Otherwise just show this data point
     */
    update(datum: Datum): void {
        if (this.startTime) {
            let timePlayed = SonifyFixedDuration.audioCtx.currentTime - this.startTime;
            let timeLeft = this.duration - timePlayed;
            this.extend(timeLeft + this.duration)
        } else {
            let node = this.create(datum);
            node.onended = () => this.resetAudioNode();
        }
    }

    /**
     * Create a new display for this datum
     */
    protected abstract create(datum: Datum) : AudioScheduledSourceNode;


    /**
     * Extend the time the audio node is playing for
     * Must be defined for this to work, is node specific
     */
    protected abstract extend(timeAdd: number);

    /**
     * Reset audio node to undefined.
     * useful for sonifications that need a new node every time. e.g. noise and potentially speech.
     */
    public resetAudioNode() {
        this.outputNode = undefined;
        this.startTime = undefined;
    }
}
