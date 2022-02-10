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

    /**
     * Start playing the current datum.
     */
    start() {
        super.start()
        if (DEBUG) console.log("file output playing specifically !!!!")
    }

    /**
     * Generates a new file sonifier
     * @returns Returns an instance of specific subclass of SonificationType.
     */
    public constructor(buffer? : ArrayBuffer) {
        super()
        const source = FileOutput.audioCtx.createBufferSource()
        if (buffer) FileOutput.audioCtx.decodeAudioData(buffer, (buffer) => source.buffer = buffer)
        this._outputNode = source
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
