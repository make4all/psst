import { domainToASCII } from 'url';
import { Sonify } from './Sonify'

const DEBUG = true

/**
 * Class for sonifying a point using an uploaded file.
 * @extends Sonify
 */
export class FileOutput extends Sonify {

    // is update() even necessary??
    // stop() not necessary atm?
    // pause() also not necessary

    private buffer : ArrayBuffer | undefined;

    /**
     * Start playing the current datum.
     */
    start() {
        this.initialize()
        super.start()
        let output = this._outputNode as AudioBufferSourceNode
        output?.start()
        if (DEBUG) console.log("file output playing specifically !!!!")
    }

    /**
     * Generates a new file sonifier
     * @returns Returns an instance of specific subclass of SonificationType.
     */
     public constructor(buffer? : ArrayBuffer) {
        super()
       	if (buffer) this.buffer = buffer
    }

    public initialize() {
        if (this.buffer) {
            const source = FileOutput.audioCtx.createBufferSource()
            FileOutput.audioCtx.decodeAudioData(this.buffer, (buffer) => source.buffer = buffer)
            this._outputNode = source
        }
    }

    /**
     *
     * @returns A string describing the current frequency being played.
     */
    public toString(): string {
        let audioFile = this.outputNode as AudioBufferSourceNode
        if (audioFile) return `FileOutput playing`
        else return `FileOutput not currently playing`
    }
}
