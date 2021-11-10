import Ajv from "ajv";
import { Spec } from "vega-typings/types";
import * as schema from "./Vega-schema.json"
export function validateVegaSpec(data: Spec)
{
    const ajv = new Ajv();
    const validate = ajv.compile(schema)
    const isValid = validate("hello")
    console.log("isValid",isValid)  
    if(!isValid)
    {
        const errors = ajv.errorsText()
        throw new Error(`Validation Error. ${errors}`)
    }
    return isValid

}



