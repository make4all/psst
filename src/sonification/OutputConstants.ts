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
// currently uses the 3rd and 4th octave
const pianoKeys = new Map<string, [number, boolean]>([
    ['KeyQ', [130.81, false]], // C3
    ['Digit2', [138.59, true]], // C3#
    ['KeyW', [146.83, false]], // D3
    ['Digit3', [155.56, true]], // D3#
    ['KeyE', [164.81, false]], // E3
    ['KeyR', [174.61, false]], // F3
    ['Digit5', [185.00, true]], // F3#
    ['KeyT', [196.00, false]], // G3
    ['Digit6', [207.65, true]], // G3#
    ['KeyY', [220.00, false]], // A3
    ['Digit7', [233.08, true]], // A3#
    ['KeyU', [246.94, false]], // B3
    ['KeyZ', [261.63, false]], // C4
    ['KeyS', [277.18, true]], // C4#
    ['KeyX', [293.66, false]], // D4
    ['KeyD', [311.13, true]], // D4#
    ['KeyC', [329.63, false]], // E4
    ['KeyV', [349.23, false]], // F4
    ['KeyG', [369.99, true]], // F4#
    ['KeyB', [392.00, false]], // G4
    ['KeyH', [415.30, true]], // G4#
    ['KeyN', [440.00, false]], // A4
    ['KeyJ', [466.16, true]], // A4#
    ['KeyM', [493.88, false]] // B4
]);

export function getPianoKeys() {
    return pianoKeys;
}