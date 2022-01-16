/**
 * The source for a stream of data
 * @field id A unique id for this data source
 * @method toString returns a description of this Data Source
 */
export interface DataSource {
    id: number;
    toString(): String;
}
