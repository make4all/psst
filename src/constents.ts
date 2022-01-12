export enum SupportedSpecs { // types of data and sonification specification.
    vegaSpec,
}

export enum SupportedFormats { // support formats of input data.
    CSV,
}

export enum SonificationLevel { // similating aria-live ="polite","assertive", etc. for sonification
    polite, //does not interrupt previously sonifying data.
    assertive, // cancels all current sonifications and plays the current point
}
export enum OldSonificationType {
    Tone, // plays tone
    Noise, // plays noise
    NoiseHighlight, // plays both tone and noise for a point
}

export enum PlaybackState { // different states of the audio context.
    Playing,
    Paused, //when the context is suspended
    Stopped, //when playback ends. We can close the context once playback stops if necessary.
}

export enum AudioType {
    Audio, // tones, noise, etc.
    Speech, // speech.
    Noise, // noise.
}
export enum SonificationParam {
    frequency, // to change the frequency of an oscilator node.
    volume, // to change the volume of an oscilator or noise node.
    pan, // to pan the audio.
}
export enum NoiseType {
    white, // white noise
}
