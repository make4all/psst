// You are an assistant and your job is to help create audio representations of data.
// To do this, you will use functions from the PSST toolkit, which is a library of data handlers (tools that manipulate data), and data outputs (tools that output data through audio or speech).
// You will be given information about where the data is generated from, and a goal that the user wants to achieve with the audio representation you will help create.
// example sources of the data can be accelerometer data, demographic data, and data sets from other large projects.
// some general rools to keep in mind:
// 1. continuous audio output generally helps convey trends. a user can not process more than 2 simultaneous audio sources.
// 2. speech output helps convey precise data points. abundance of speech can cause cognitive overload so these should be used wisely.
// 3. extrema handlers can help communicate the limits of values.
// 4. slope handlers can help convey change in trends.

export type PSSTActions = {
    actions: Action[]
}

export type Action =
    | addSink
    | getSink
    | deleteSink
    | addNoteHandler
    | addFilterRangeHandler
    | addSpeechtHandler
    | addNotificationHandler
    | addSlopeParityHandler
    | addRunninExtremaHandler
    | addNoteSonifyOutput
    | addSpeechOutput
    | addSonifyFixedDurationOutput
    | UnknownAction



export interface UnknownAction {
    actionType: 'unknown'
    // text typed by the user that the system did not understand
    text: string
}


// Sinks 

// AddSink takes optional arguments and based on what is provided either constructs a new data sink or uses a given one. In either case, it adds it to the set of sinks.
export type addSink = {
    actionType: 'add sink'
    event: AddSinkEvent
}

// Returns the DataSink associated with sinkId.
export type getSink = {
    actionType: 'get sink'
    event: GetSinkEvent
}

// Removes a data sink. Once removed, that Id may be re-used.
export type deleteSink = {
    actionType: 'delete sink'
    event: DeleteSinkEvent
}


// Handlers

export type addNoteHandler = {
    actionType: 'add note handler' // NoteHandler (A DataHandler that outputs a Datum as a note in the audible range. Assumes a note should be played in the general range of 80 to 500 Hz.)
    event: NoteHandlerEvent
}

export type addFilterRangeHandler = {
    actionType: 'add filter range handler' // FilterRangeHandler (A DataHandler that filters out things which are not betwen min and max (inclusive).)
    event: FilterRangeHandlerEvent
}

export type addNotificationHandler  = {
    actionType: 'add notification handler' // NotificationHandler (A DataHandler that notifies if a set of point/s are seen.)
    event: NotificationHandlerEvent
}

export type addRunninExtremaHandler = {
    actionType: 'running extrema handler' // RunningExtremaHandler (A DataHandler that outputs the running extrema of the data.)
    event: RunningExtremaHandlerEvent
}

export type addSlopeParityHandler = {
    actionType: 'slope parity handler' // SlopeParityHandler (A DataHandler that tracks the slope of the data.)
    event: SlopeParityHandlerEvent
}

export type addSpeechtHandler  = {
    actionType: 'speech handler' // SpeechHandler (A DataHandler that outputs the data as speech.)
    event: SpeechHandlerEvent
}


// Outputs

export type  addNoteSonifyOutput = {
    actionType: 'add note sonify output' // Class for sonifying a data point as a pitch.
    event: NoteSonifyOutputEvent
}

export type addSpeechOutput = {
    actionType: 'add speech output' // s\Sonifying data point as speech.
    event: SpeechOutputEvent
}

export type addSonifyFixedDurationOutput = {
    actionType: 'add sonify fixed duration output' // Class for sonifying a data point as a pitch. Creates a Fixed Duration sound output.
    event: SonifyFixedDurationOutputEvent
}


// Sink Events
export type GetSinkEvent = {
    sinkId: number // A unique id for the sink
}

export type AddSinkEvent = {
    sinkId?: number // A unique id for the sink
    description?: string // A description for the sink
}

export type DeleteSinkEvent = {
    sinkId: number // A unique id for the sink
}


// Adding Data Handler to Sink Events 

export type NoteHandlerEvent = {
    sinkId: number
    min?: number // A DataHandler that outputs a Datum as a note in the audible range. Assumes a note should be played in the general range of 80 to 500 Hz to sound nice.
    max?: number 
}

export type FilterRangeHandlerEvent = {
    sinkId: number
    min?: number // min value of the range
    max?: number // max value of the range
}


export type NotificationHandlerEvent = {
    sinkId: number // A unique id for the sink
    interestPoints?: number[] 
}

export type RunningExtremaHandlerEvent = {
    sinkId: number
    direction?: number // the maxima or minima that will be notified about by the RunningExtremaHandler this defaults to 1 if not specified takes values of 1 for maxima or -1 for minima
}

export type SlopeParityHandlerEvent = {
    sinkId: number
    direction?: number // The direction of the slope to be notified about by the SlopeParityHandler this defaults to 0 if not specified and takes values 1 for increasing slope or -1 for decreasing slope
}

export type SpeechHandlerEvent = {
    sinkId: number
    volume?: number // The volume of the speech output this defaults to 1 if not specified
}


// Adding Data Outputs to Data Handler Events

export type NoteSonifyOutputEvent = {
    sinkId: number
    pan: number // The pan of the note output this defaults to 0 if not specified.
    
}

export type SpeechOutputEvent = {
    sinkId: number
    lang?: string // The language of the speech output this defaults to 'en' if not specified
    volume?: number // The volume of the speech output this defaults to 1 if not specified. Volume is 0-1
    rate?: number // The rate of the speech output this defaults to 10 if not specified. Rate is 0.1-10
    polite: boolean // Whether the speech output should be polite this defaults to false if not specified
}

export type SonifyFixedDurationOutputEvent = {
    sinkId: number
    duration?: number // The duration of the note output this defaults to 0.1 if not specified.
    pan?: number // The pan of the note output this defaults to 0 if not specified.
}






