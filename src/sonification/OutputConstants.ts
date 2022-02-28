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

// Used by SheetMusic to represent different notes.
// Should read as 1A, for example, but enum won't accept numeric names.
export enum Note {
    C1,
    D1,
    E1,
    F1,
    G1,
    A1,
    B1,
    C2,
    D2,
    E2,
    F2,
    G2,
    A2,
    B2,
    C3
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
