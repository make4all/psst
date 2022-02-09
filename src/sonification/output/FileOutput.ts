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

    private fileName = "./beep.wav"

    /**
     * Start playing the current datum. This starts the oscillator again.
     */
    start() {
        super.start()
    }

    /**
     * Generates a new file sonifier
     * @returns Returns an instance of specific subclass of SonificationType.
     */
    public constructor() {
        super()
        this.getFile(FileOutput.audioCtx, this.fileName)
    }

    public getFile(audioContext, filepath) {
        const source = FileOutput.audioCtx.createBufferSource();
        fetch(filepath)
            .then(response => response.arrayBuffer())
            .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
            .then(sample => source.buffer = sample)
            .catch(console.error)
        return source;
    }

    /**
     *
     * @returns A string describing the current frequency being played.
     */
    public toString(): string {
        let audioFile = this.outputNode as MediaElementAudioSourceNode
        if (audioFile) return `FileOutput playing ${this.fileName}`
        else return `FileOutput not currently playing`
    }
}
