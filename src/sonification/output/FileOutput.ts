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

    private fileName = "./beep.mp3"

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
        let buffer;
        let load = () => {
            const request = new XMLHttpRequest();
            request.open("GET", this.fileName);
            request.responseType = "arraybuffer";
            request.onload = function() {
                let undecodedAudio = request.response;
                FileOutput.audioCtx.decodeAudioData(undecodedAudio, (data) => buffer = data, function(error) {
                    console.error("decodeAudioData error", error);
                });
                console.log("loaded!")
            };
            request.send();
        }
        load()
        const source = FileOutput.audioCtx.createBufferSource();
        source.buffer = buffer;
        this._outputNode = source
    }

    public load() {

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
