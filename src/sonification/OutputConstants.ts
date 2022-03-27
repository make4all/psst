import { Observable, tap } from 'rxjs'
import { Datum } from './Datum'

/**
 * SonificationLevel is typically associated with a specific point being sonified
 * It is intended to be used similar to aria-live tags="polite","assertive", etc. for sonification
 *
 * @todo figure out where in the architecture this can/should be used. Is it per data sink for example?
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
export enum OutputStateChange {
    /** Output should start (become visible/audible) */
    Play,
    /** Output should pause */
    Pause,
    /** Output should end */
    Stop,
    /** Output state unknown */
    Undefined,
    /** Swap States (between Pause and Play)*/
    Swap,
}

/**
 * Used by statistics keeping track of a value with regard to the data domain
 */
export enum GrowthDirection {
    Max,
    Min,
}

/**
 * For debugging
 */
export enum SonificationLoggingLevel {
    TRACE,
    DEBUG,
    INFO,
    ERROR,
}

let sonificationLoggingLevel = SonificationLoggingLevel.DEBUG

export function getSonificationLoggingLevel(): SonificationLoggingLevel {
    return sonificationLoggingLevel
}
export function setSonificationsLoggingLevel(level: SonificationLoggingLevel) {
    sonificationLoggingLevel = level
}

const keyFreq = new Map<string, number>([
    ['Digit1', 130.81], // C3
    ['Digit2', 146.83], // D3
    ['Digit3', 164.81], // E3
    ['Digit4', 174.61], // F3
    ['Digit5', 196.00], // G3
    ['Digit6', 220.00], // A3
    ['Digit7', 246.94], // B3
    ['KeyQ', 261.63], // C4
    ['KeyW', 293.66], // D4
    ['KeyE', 329.63], // E4
    ['KeyR', 349.23], // F4
    ['KeyT', 392.00], // G4
    ['KeyY', 440.00], // A4
    ['KeyU', 493.88], // B4
    ['KeyA', 523.25], // C5
    ['KeyS', 587.33], // D5
    ['KeyD', 659.25], // E5
    ['KeyF', 698.46], // F5
    ['KeyG', 783.99], // G5
    ['KeyH', 880.00], // A5
    ['KeyJ', 987.77] // B5
])

export function getKeyFreq() {
    return keyFreq;
}