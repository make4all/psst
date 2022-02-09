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

    private fileName = "./beep.wav"
    private audio;

    /**
     * Start playing the current datum. This starts the oscillator again.
     */
    start() {
        super.start()
        if (this.audio) {
            this.audio.play()
        }
    }

    /**
     * Generates a new file sonifier
     * @returns Returns an instance of specific subclass of SonificationType.
     */
    public constructor() {
        super()
        this.audio = new Audio(this.fileName)
        this.audio.type = 'audio/wav';
        // document.children[0].children[1].appendChild(this.audio)
        const output = FileOutput.audioCtx.createMediaElementSource(this.audio)
        this._outputNode = output
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
