export enum SupportedSpecs { // types of data and sonification specification.
    vegaSpec,
}

export enum SupportedFormats { // support formats of input data.
    CSV,
}

/**
 * SonifiationLevel is typically associated with a specific point being sonified 
 * It is intended to be used similar to aria-live tags="polite","assertive", etc. for sonification
 * @readonly
 * @enum {number}
 */
export enum SonificationLevel { /
    polite, //does not interrupt previously sonifying data.
    assertive, // cancels all current sonifications and plays the current point
}

/**
 * The current state of the audio context. 
 * @readonly
 * @enum {number}
 */
export enum PlaybackState { 
    /** Audio is currently playing */
    Playing,
    /** Audio is paused, meaning the Audio context is suspended */
    Paused, 
    /** Playback has ended. We can close the context once playback stops if necessary.*/
    Stopped, 
}

/** deprecating */
export enum AudioType {
    Audio, // tones, noise, etc.
    Speech, // speech.
    Noise, // noise.
}
/** deprecating */
export enum SonificationParam {
    frequency, // to change the frequency of an oscilator node.
    volume, // to change the volume of an oscilator or noise node.
    pan, // to pan the audio.
}
/** deprecating */
export enum NoiseType {
    white, // white noise
}
