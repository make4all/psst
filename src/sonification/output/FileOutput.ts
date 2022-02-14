import { Datum } from "../Datum";
import { SonifyFixedDuration } from "./SonifyFixedDuration";

export class FileOutput extends SonifyFixedDuration {

  private buffer : ArrayBuffer | undefined;

  constructor(buffer? : ArrayBuffer) {
    super()
    if (buffer) { // for sure going into this branch in demo when constructed
      this.buffer = buffer
    }
  }
  protected create(datum: Datum): AudioScheduledSourceNode {
    const source = FileOutput.audioCtx.createBufferSource()
    if (this.buffer) { // a buffer for sure exists each time create is called
      FileOutput.audioCtx.decodeAudioData(this.buffer.slice(0), (buffer) => source.buffer = buffer)
      this.outputNode = source
      // ADDED FOLLOWING LINE
      this.outputNode.connect(FileOutput.gainNode)
      source.start()
    }
    if (source.buffer) this.duration = source.buffer.duration
    return source
  }

  protected extend(timeAdd: number) {
    throw new Error("Method not implemented.");
  }
}