import { Datum } from "../Datum";
import { SonifyFixedDuration } from "./SonifyFixedDuration";

export class FileOutput extends SonifyFixedDuration {

  private buffer : ArrayBuffer | undefined;

  constructor(buffer? : ArrayBuffer) {
    super()
    if (buffer) this.buffer = buffer
  }
  protected create(datum: Datum): AudioScheduledSourceNode {
    const source = FileOutput.audioCtx.createBufferSource()
    if (this.buffer) {
      FileOutput.audioCtx.decodeAudioData(this.buffer.slice(0), (buffer) => source.buffer = buffer)
      this.outputNode = source
      source.start()
    }
    if (source.buffer) this.duration = source.buffer.duration
    return source
  }
  protected extend(timeAdd: number) {
    throw new Error("Method not implemented.");
  }
}