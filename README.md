# sonification

The Physical computing Streaming Sensor Sonification Toolkit (PSSST) is designed to simplify the authoring of  sonification of live sensor data for the purposes of understanding, testing, and debugging sensors. The toolkit is designed more generally to support authoring across different types of streaming data, but has prioritized features that will specifically be helpful when dealing with multiple sensor data streams.

## Basic Usage

We start with a simple example of how to use PSST. This example is a summary of what is done in [Jacdac.tsx](https://github.com/make4all/sonification/blob/main/src/pages/Jacdac.tsx). 
- First get an instance of [```OutputEngine```](https://make4all.github.io/sonification/classes/sonification_OutputEngine.OutputEngine.html) using [```OutputEngine.getInstance()```](https://make4all.github.io/sonification/classes/sonification_OutputEngine.OutputEngine.html#getInstance) This method enforces that there is only ever one OutputEngine. The OutputEngine is the repository for all data sinks and their associated outputs.
- Next, add a new [```DataSink```](https://make4all.github.io/sonification/classes/sonification_DataSink.DataSink.html) to the board, by calling [```board.addSink("name")```](https://make4all.github.io/sonification/classes/sonification_OutputEngine.OutputEngine.html#addSink). 
- This [```DataSink```](https://make4all.github.io/sonification/classes/sonification_DataSink.DataSink.html) must be configured. 
   - Many outputs benefit from a few statistics about the dataset it will output. In the simplest case, if known, it is valuable to add  ```max``` and ```min``` stat for the dataset. 
	 - In addition, we must add a [```DataHandler```](https://make4all.github.io/sonification/classes/sonification_handler_DataHandler.DataHandler.html) class which knows how to handle and potentially output the data. For example, in [```Jacdac.tsx```](https://github.com/make4all/sonification/blob/main/src/pages/Jacdac.tsx) we add a  [```NoteHandler```](https://make4all.github.io/sonification/classes/sonification_handler_NoteHandler.NoteHandler.html) to this sink, which will cause incoming data to be mapped into an audible range and then outputed as audible notes created using an oscillator. It is possible to add multilpe such handlers to a single sink. 
- Finally, the [```OutputEngine```](https://make4all.github.io/sonification/classes/sonification_OutputEngine.OutputEngine.html) must be started up, using [```board.onPlay()```](https://make4all.github.io/sonification/classes/sonification_OutputEngine.OutputEngine.html#onPlay)

This is the initial configuration, the only remaining step is to ensure that data is being delivered. There are currently two ways to do this. in ```Jacdac.tsx``` we use the ```OutputEngine``` to deliver data to a sink declaratively, by calling [```board.pushPoint(value, sinkId)```](https://make4all.github.io/sonification/classes/sonification_OutputEngine.OutputEngine.html#pushPoint). The alternative (seen in [DemoSimple](https://github.com/make4all/sonification/blob/main/src/views/demos/DemoSimple.tsx)) is to directly subscribe a sink to an rxjs stream by calling ```setStream(sink : Observer<Datum>)``` 

Outputs and Handlers work together. For example, a ```NoteHandler``` will sonify incoming data as audible notes. If we also add a ```FilterRangeHandler``` with an attached ```NoiseSonify``` output, those notes that are inside the specified range will *additionally* play white noise. 


That`s it. Add a sink, configure it with one or more handlers, and push data.  More details on all of this below. 

## The OutputEngine class

The ```OutputEngine``` class is designed to only ever have a single instance. This means that even as the user flips from one webpage to another there is still a way to keep outputs running (or turn them off, or change their volume). It also handles glabel needs like pausing the audio for all data sinks, generating a new data sink class with a unique ID as needed, adjusting overall volume (still TBD), and pushing a new data point to a specific stream declaritively. 

## The DataSink class

Data sinks are holders for a specific data sink. For the most part, our current implementation assumes each ``DataSink`` class will handle only a single sink of timestamped streaming numbers (specifically, streames containing the [```Datum```](https://make4all.github.io/sonification/classes/sonification_Datum.Datum.html) class.  As described above, streaming data can either be provided as an [Rxjs](https://rxjs.dev/) ```Observable``` or through a call to ```OutputEngine.pushPoint()```.

Data sinks do not record data that comes through them, however, they do have the capability to record *statistics about that data*. Specifically, one or more static values, or calculated statistics, can be added to a data sink, each of which must implement the [```Calculator```](https://make4all.github.io/sonification/interfaces/sonification_stat_Calculator.Calculator.html) interface.

Data sinks also have a list of [```Handler```](https://make4all.github.io/sonification/modules/sonification_handler_DataHandler.DataHandler.html) classes which handle incoming data. Handlers are described more in depth below, but they may filter data, calculate an adjusted value for data, and/or cause data to be outputed. They can be thought of as dispatch handlers for data. 

The primary role of a ```DataSink``` is to handle incoming data. When the sink is not stopped, Data is handled as followed
- First the ```DataSink``` walks through each calculated statistic and updates it
- Next, the ```Datasink``` walks through each ```DataHandler```, calling [```DataHandler.handleDatum(Datum) : boolean```](https://make4all.github.io/sonification/classes/sonification_handler_DataHandler.DataHandler.html#handleDatum). If a call to ```DataHandler.handleDatum()``` returns false, dispatch stops, otherwise dispatch continues until the end of the list of handlers. 

Finally, each ```DataSink``` can ```start()``` ```stop()``` and ```pause()``` the output of data. When these methods are called, the ```DataSink``` updates its own state, and that of all of its handlers. 

# Datum 
A [```Datum```](https://make4all.github.io/sonification/classes/sonification_Datum.Datum.html) is just a single item of a data stream. It knows which sink it is being handled by, and has a raw value, a timestamp, and an adjusted value. Some outputs may use the adjusted value instead of the raw value to decide how to render the Datum. 

# Handlers 
A Handler is an abstract class that is designed to handle streaming data. This happens when [```DataHandler.handleDatum(): boolean```](https://make4all.github.io/sonification/classes/sonification_handler_DataHandler.DataHandler.html#handleDatum) is called. 

A ```DataHandler``` should behave in the following ways
- It should handle data appropriately based on its mode, whether paused, outputting or stopped
- It needs to decide whether data handling is done (in which case it returns false from ```handleDatum()``` or whether it is ok for the (unknown) next ```DataHandler``` class in the disptach order to receive the ```Datum```
- If relevant, it should output the ```Datum```.
A handler may have one or more [```DatumOutput```](https://make4all.github.io/sonification/classes/sonification_output_DatumOutput.DatumOutput.html) classes which are used to render the ```Datum```. The handler will loop through each, if they exist, and call ```DatumOutput.update(Datum)```. 

In addition, ```Handlers``` handle basic features such as adding and removing ```DatumOutput``` classes and ```start()```, ```stop()``` and ```pause()```.

Some examples may help to clarify how ```Handler``` classes work. 
- The [```FilterRangeHandler```](https://make4all.github.io/sonification/classes/sonification_handler_FilterRangeHandler.FilterRangeHandler.html) causes data dispatch to stop if a data point is outside its specified range. Right now, this class supports only a single range with no intelligence, but more sophisticated filters could be imagined. If a output is attached to the ```FilterRangeHandler```, it will call  ```update()``` on that output only when  the ```Datum``` is in range.
- The [```ScaleHandler```](https://make4all.github.io/sonification/classes/sonification_handler_ScaleHandler.ScaleHandler.html) takes in a conversion function and uses it to modify ```Datum.adjustedValue``` for every point it sees. We subclass it in [```NoteHandler```](https://make4all.github.io/sonification/classes/sonification_handler_NoteHandler.NoteHandler.html) to parameterize it with a [Mel Scale](https://en.wikipedia.org/wiki/Mel_scale) transformation. 

We haven't implemented all handlers. Some additional ones that we are thinking of adding:
- *SlopeHandler* would keep track of the the slope between data points and then assign an adjusted value on that basis. An alternative version might store the parity of the slope.

# Outputs 
The same output can be used by more than one handler. We currently include only outputs that sonify data with nonspeech audio, though we plan to add a speech output. They all inheret from [```Sonify```](https://make4all.github.io/sonification/classes/sonification_output_Sonify.Sonify.html), which in turn inherets from ```DatumOutput```. We currently support the following
- [```NoteSonify```](https://make4all.github.io/sonification/classes/sonification_output_NoteSonify.NoteSonify.html) which uses ```Datum.adjustedValue``` as a frequency for an oscillator. It plays data continuously and only stops when the data stream ends on ```stop()``` is called.
- [```NoiseSonify```](https://make4all.github.io/sonification/classes/sonification_output_NoiseSonify.NoiseSonify.html), which inherets from [```SonifyFixedDuration```](https://make4all.github.io/sonification/classes/sonification_output_SonifyFixedDuration.SonifyFixedDuration.html) and creates white noise when a ```Datum``` is passed to it. 

# Statistics
Currently the only implemented statistic is a ```RunningAverage```. However we have discussed other ideas for statistics such as  an ```Extreme``` (could keep track of outliers in the data stream)



