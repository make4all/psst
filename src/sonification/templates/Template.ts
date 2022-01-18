import { display } from "@mui/system";
import { DataSource } from "../DataSource";
import { Datum } from "../Datum";
import { DatumDisplay } from "../displays/DatumDisplay";

/**
 * A template interface is used to decide how to display each data point. 
 */
export abstract class Template {

    /**
     * Store a display if this template has one
     */
    public displays: Array<DatumDisplay>

    /**
     * 
     * @param display An optional way to display the data
     */
    constructor(display?: DatumDisplay) {
        this.displays = new Array();
        if (display) this.displays.push(display);
    }

    /**
     * Decides whether processing should stop and optionally assigns a display type.
     * 
     * @param datum 
     * @param source 
     * @returns true if processing should continue
     */
    public handleDatum(datum: Datum, source: DataSource): boolean {
        this.displays.map((display) => display.update(datum));
        return true;
    }

    public toString(): string {
        return "Template"
    }
}