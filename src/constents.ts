export enum SupportedSpecs { // types of data and sonification specification.
    vegaSpec,
}

export enum SupportedFormats { // support formats of input data.
    CSV,
}

export enum sonificationLevel { // similating aria-live ="polite","rude", etc. for sonification
    polite, //does not interrupt previously sonifying data.
    rude, // cancels all current sonifications and plays the current point
}
