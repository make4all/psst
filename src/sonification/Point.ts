import { DataSource } from './DataSource';
import { SonificationLevel } from './SonificationConstants';
import { SonificationType } from './SonificationType';

/**
 * The base interface for a data point. This is an interface because data points
 * may be used in other settings as well and we don't want to be too strict about what they are.
 *
 * All data points have certain properties and abilities, however
 * @field value The raw data value associated with this point
 * @field scaledValue The data value that will be used to sonify this point [note: Not sure if this makes sense, should revisit as architecture gets refined]
 * @field Priority The importance of playing this point [note: should this be per point, or per SonificationType?]
 * @field SonificationType an array of sonification objects for this point [note: Sonification type should probably be refactored with a new name, and I feel like we should require at least one. Currently this field is optional]
 * @field previous The previous point in the sequence for this source
 * @method toString() Returns a string describing this data point
 * @field source The data source this point is associated with [not sure if we need this pointer, but for completeness...]
 */

export interface Point {
    value: number;
    scaledValue: number;
    Priority: SonificationLevel;
    SonificationType?: SonificationType[];
    toString(): String;
    source: DataSource;
    previous: Point;
}
