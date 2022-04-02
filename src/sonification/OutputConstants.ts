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

// maps from key -> frequency and if note is black
// currently uses the 4th octave
const pianoKeys = new Map<string, [number, boolean]>([
    ['KeyA', [261.63, false]], // C
    ['KeyW', [277.18, true]], // C#
    ['KeyS', [293.66, false]], // D
    ['KeyE', [311.13, true]], // D#
    ['KeyD', [329.63, false]], // E
    ['KeyF', [349.23, false]], // F
    ['KeyT', [369.99, true]], // F#
    ['KeyG', [392.00, false]], // G
    ['KeyY', [415.30, true]], // G#
    ['KeyH', [440.00, false]], // A
    ['KeyU', [466.16, true]], // A#
    ['KeyJ', [493.88, false]] // B
]);

export function getPianoKeys() {
    return pianoKeys;
}


const keyFreq = new Map<string, number>([
    ['Digit1', 65.41], // C2
    ['Digit2', 73.42], // D2
    ['Digit3', 82.41], // E2
    ['Digit4', 87.31], // F2
    ['Digit5', 98.00], // G2
    ['Digit6', 110.00], // A2
    ['Digit7', 123.47], // B2
    ['KeyQ', 130.81], // C3
    ['KeyW', 146.83], // D3
    ['KeyE', 164.81], // E3
    ['KeyR', 174.61], // F3
    ['KeyT', 196.00], // G3
    ['KeyY', 220.00], // A3
    ['KeyU', 246.94], // B3
    ['KeyA', 261.63], // C4
    ['KeyS', 293.66], // D4
    ['KeyD', 329.63], // E4
    ['KeyF', 349.23], // F4
    ['KeyG', 392.00], // G4
    ['KeyH', 440.00], // A4
    ['KeyJ', 493.88], // B4
])

export function getKeyFreq() {
    return keyFreq;
}