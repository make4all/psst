import Ajv from "ajv";
import { Spec } from "vega-typings/types";
import { SupportedFormats } from "./constents";
import * as schema from "./Vega-schema.json"
import * as fs from "fs";
import csv from "csv-parser";
export function validateVegaSpec(data: Spec | string)
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

export function parseInput(fileName: string | undefined, format: SupportedFormats) {
    console.log("in parseInput function");
    const results: any[] = []
    if(format == SupportedFormats.CSV)
    {
      console.log("format is CSV")
      if(fileName){
  console.log("file name",fileName)
        var rs = fs.createReadStream(fileName)
  rs.pipe(csv()).on('data',(data) => results.push(data) )
  // .pipe(csv()).on('data',(data) => results.push(data)); 
  console.log("parsed CSV data:",results);
    }
  }
  }


export class AudioQueue {
  private storage: {[index:number]:AudioScheduledSourceNode};
  private enqueuePointer:number;
  private dequeuePointer:number;

  public constructor()
  {
    this.dequeuePointer = 0;
    this.enqueuePointer = 0;
    this.storage = Object.create(null);
  }
  public enqueue(item:AudioScheduledSourceNode) {
    this.storage[this.enqueuePointer] = item;
    this.enqueuePointer++;
  }

  public dequeue(): AudioScheduledSourceNode | undefined {
    if(this.dequeuePointer !== this.enqueuePointer) {
      const dequeuedData = this.storage[this.dequeuePointer];
      dequeuedData.stop();
      delete this.storage[this.dequeuePointer];
      this.dequeuePointer++;
      return dequeuedData;
    }
    return undefined;
  }
  public emptyAudioQueue(): void {
    while(this.enqueuePointer !== this.dequeuePointer)
    this.dequeue();
  }
  }
