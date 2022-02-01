/**
 * SonificationLevel is typically associated with a specific point being sonified
 * It is intended to be used similar to aria-live tags="polite","assertive", etc. for sonification
 *
 * @todo figure out where in the architecture this can/should be used. Is it per datasource for example?
 * @readonly
 * @enum {number}
 */
export enum SonificationLevel {
    polite, //does not interrupt previously sonifying data.
    assertive, // cancels all current sonifications and plays the current point
}

/**
 * The current state of the audio context.
 * @readonly
 * @enum {number}
 */
export enum DisplayState {
    /** Audio is currently playing */
    Displaying,
    /** Audio is paused, meaning the Audio context is suspended */
    Paused,
    /** Playback has ended. We can close the context once playback stops if necessary.*/
    Stopped,
}
