export class AudioQueue {
    private storage: { [index: number]: AudioScheduledSourceNode }
    private enqueuePointer: number
    private dequeuePointer: number

    public constructor() {
        this.dequeuePointer = 0
        this.enqueuePointer = 0
        this.storage = Object.create(null)
    }
    public enqueue(item: AudioScheduledSourceNode) {
        this.storage[this.enqueuePointer] = item
        this.enqueuePointer++
    }

    public dequeue(): AudioScheduledSourceNode | undefined {
        if (this.dequeuePointer !== this.enqueuePointer) {
            const dequeuedData = this.storage[this.dequeuePointer]
            dequeuedData.stop()
            delete this.storage[this.dequeuePointer]
            this.dequeuePointer++
            return dequeuedData
        }
        return undefined
    }
    public emptyAudioQueue(): void {
        while (this.enqueuePointer !== this.dequeuePointer) this.dequeue()
    }
}

export class PointQueue {
    private storage: { [index: number]: number }
    private enqueuePointer: number
    private dequeuePointer: number

    public constructor() {
        this.dequeuePointer = 0
        this.enqueuePointer = 0
        this.storage = Object.create(null)
    }
    public enqueue(item: number) {
        this.storage[this.enqueuePointer] = item
        this.enqueuePointer++
    }

    public dequeue(): number | undefined {
        if (this.dequeuePointer !== this.enqueuePointer) {
            const dequeuedData = this.storage[this.dequeuePointer]
            delete this.storage[this.dequeuePointer];
            this.dequeuePointer++;
            return dequeuedData;
        }
        return undefined
    }
    public emptyPointQueue(): void {
        while (this.enqueuePointer !== this.dequeuePointer) this.dequeue()
    }
}