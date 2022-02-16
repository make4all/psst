# Sonification

The Physical computing Streaming Sensor Sonification Toolkit (PSSST) is designed to simplify the authoring of  sonification of live sensor data for the purposes of understanding, testing, and debugging sensors. The toolkit is designed more generally to support authoring across different types of streaming data, but has prioritized features that will specifically be helpful when dealing with multiple sensor data streams.

The basic architecture of PSSST is strea based. Two different streams are needed to visualize data:

- A stream of [```OutputStateChange```](https://make4all.github.io/sonification/enums/sonification_OutputConstants.OutputStateChange.html) events which provide information about whether PSSST should do things like start, pause, or stop output
- One or more streams of [```Datum```](https://make4all.github.io/sonification/classes/sonification_Datum.Datum.html) events to be outputed

These are merged together into [```OutputStateChange```, ```Datum```] tuples and passed various parts of the PSSST architecture subscribe to this stream and act on it. More details on all of this below.

## Basic Usage

We start with a simple example of how to use PSSST. This example is a summary of what is done in [DemoSimple.tsx](https://github.com/make4all/sonification/blob/main/src/views/demos/DemoSimple.tsx). We break this up according to the two streams described above, along with sonification authoring.

```DemoSimple``` is a very simple demonstration app that allows the user to pause and play data from a fixed CSV file at a fixed rate (once every 500 ms)

### [```OutputStateChange```] Stream

```DemoSimple``` provides the user with an interface for playing and pausing data streaming, and this same interface is used to generate the stream of ```OutputStateChange``` events. To do this, ```DemoSimple``` must

- First get an instance of [```OutputEngine```](https://make4all.github.io/sonification/classes/sonification_OutputEngine.OutputEngine.html) using [```OutputEngine.getInstance()```](https://make4all.github.io/sonification/classes/sonification_OutputEngine.OutputEngine.html#getInstance) This method enforces that there is only ever one OutputEngine. The OutputEngine is the repository for all data output
- When something happens that affects output state, ```DemoSimple``` simply calls ```outputEngine.next(OutputSateChange.[State])``` on the ```OutputEngine``` instance. This in turn will ensure that anything subscribed to the stream of tuples being produced by ```OutputEngine``` is updated.
- Note that until, the [```OutputEngine```](https://make4all.github.io/sonification/classes/sonification_OutputEngine.OutputEngine.html) is be started up, using [```outputEngine.next(OutputStateChange.Play)```](https://make4all.github.io/sonification/classes/sonification_OutputEngine.OutputEngine.html#next)

### Display Authoring

To author a sonification, or any other display of information,```DemoSimple``` must specify a few key pieces of information:
- First it  adds a new [```DataSink```](https://make4all.github.io/sonification/classes/sonification_DataSink.DataSink.html) to the OutputEngine, by calling [```outputEngine.addSink("name")```](https://make4all.github.io/sonification/classes/sonification_OutputEngine.OutputEngine.html#addSink) on the ```OutputEngine``` instance.
- This [```DataSink```](https://make4all.github.io/sonification/classes/sonification_DataSink.DataSink.html) must be configured.
   - In order to output any information, a [```DataSink```] must have a stream of data to display. This is provided by calling [```outputEngine.setStream(stream$)```](https://make4all.github.io/sonification/classes/sonification_OutputEngine.OutputEngine.html#setStream).
   - In addition, we must add a [```DataHandler```](https://make4all.github.io/sonification/classes/sonification_handler_DataHandler.DataHandler.html) class which knows how to handle and potentially output the data. For example, in ```DemoSimply```,  we add a  [```NoteHandler```](https://make4all.github.io/sonification/classes/sonification_handler_NoteHandler.NoteHandler.html) to this sink, which will cause incoming data to be mapped into an audible range and then outputed as audible notes created using an oscillator. It is possible to add multilpe such handlers to a single sink.

### [```Datum```] Streaming

```DemoSimple``` also needs to stream data to the ```OutputEngine```. In ```DemoSimple``` we do this by creating a stream from the original array of data as follows:

```
let data$ = of(...data)
        let timer$ = timer(0, 500).pipe(debug(SonificationLoggingLevel.DEBUG, 'point number'))
        let source$ = zip(data$, timer$, (num, time) => new Datum(id, num)).pipe(
            debug(SonificationLoggingLevel.DEBUG, 'point'),
        )
```

Once a stream exists (whereever it comes from), it is a simple matter of asking the ```OutputEngine``` to pipe it into a specific ```DataSink``` as follows: [```OutputEngine.getInstance().setStream(id, source$)```](https://make4all.github.io/sonification/classes/sonification_OutputEngine.OutputEngine.html#setStream).

## The OutputEngine class

The ```OutputEngine``` class is designed to only ever have a single instance. This means that even as the user flips from one webpage to another there is still a way to keep outputs running (or turn them off, or change their volume). It also handles glabel needs like pausing the audio for all data sinks, generating a new data sink class with a unique ID as needed, adjusting overall volume (still TBD).

It's primpary purpose, however, is to merge the incoming global stream of ```OutputStateChange``` events with each ```DataSink```'s individual stream of ```Datum``` events and to keep track of all the sinks and their streams.

## The DataSink class

Data sinks are holders for a specific data sink. For the most part, our current implementation assumes each ``DataSink`` class will handle only a single stream of timestamped streaming numbers (specifically, streames containing the [```Datum```](https://make4all.github.io/sonification/classes/sonification_Datum.Datum.html) class.  As described above, streaming data can either be provided as an [Rxjs](https://rxjs.dev/) ```Observable``` or through a call to ```OutputEngine.pushPoint()```.

Data sinks contain a chain of [```Handler```](https://make4all.github.io/sonification/modules/sonification_handler_DataHandler.DataHandler.html) classes which handle incoming data. Handlers are described more in depth below, but they may filter data, calculate an adjusted value for data, and/or cause data to be outputed. They can be thought of as dispatch handlers for data. The Data sink ensures that these handlers are chained together, so that if one handler receives a stream of data and filters it, the next handler will only see the filtered version of the data. A Data sink also has a name, and a unique ID, which it enforces is added to every incoming data point.

# Datum
A [```Datum```](https://make4all.github.io/sonification/classes/sonification_Datum.Datum.html) is just a single item of a data stream. It knows which sink it is being handled by, and has a raw value, a timestamp, and an adjusted value. Some outputs may use the adjusted value instead of the raw value to decide how to render the Datum.

# Handlers
A Handler is an abstract class that is designed to handle streaming data. Handlers are chained together by the ```DataSink``` class, and any handler can also have an ```DataOutput``` class that displays the data the handler is streaming.

A ```DataHandler``` should behave in the following ways
- Should only send valid data to its outputs (the default handler filters out any undefined data)
- May wish to filter data based on other properties such as the state, or whether the data falls within a certain range
- May transform data, such as rescaling it

A handler may have one or more [```DatumOutput```](https://make4all.github.io/sonification/classes/sonification_output_DatumOutput.DatumOutput.html) classes which are used to render the ```Datum```. Each of these will be subscribed to the handler's output.

Some examples may help to clarify how ```Handler``` classes work.
- The [```FilterRangeHandler```](https://make4all.github.io/sonification/classes/sonification_handler_FilterRangeHandler.FilterRangeHandler.html) filters out  data points outside its specified range. Right now, this class supports only a single range with no intelligence, but more sophisticated filters could be imagined. If a output is attached to the ```FilterRangeHandler```, it receive only the filtered data.
- The [```ScaleHandler```](https://make4all.github.io/sonification/classes/sonification_handler_ScaleHandler.ScaleHandler.html) takes in a conversion function and uses it to modify every ```Datum``` it sees. We subclass it in [```NoteHandler```](https://make4all.github.io/sonification/classes/sonification_handler_NoteHandler.NoteHandler.html) to parameterize it with a [Mel Scale](https://en.wikipedia.org/wiki/Mel_scale) transformation.

We haven't implemented all handlers. Some additional ones that we are thinking of adding:
- *SlopeHandler* would keep track of the the slope between data points and then assign an adjusted value on that basis. An alternative version might store the parity of the slope.

# Outputs
The same output can be used by more than one handler. We currently include only outputs that sonify data with nonspeech audio, though we plan to add a speech output. They all inheret from [```Sonify```](https://make4all.github.io/sonification/classes/sonification_output_Sonify.Sonify.html), which in turn inherets from ```DatumOutput```. We currently support the following
- [```NoteSonify```](https://make4all.github.io/sonification/classes/sonification_output_NoteSonify.NoteSonify.html) which uses ```Datum.adjustedValue``` as a frequency for an oscillator. It plays data continuously and only stops when the data stream ends on ```stop()``` is called.
- [```NoiseSonify```](https://make4all.github.io/sonification/classes/sonification_output_NoiseSonify.NoiseSonify.html), which inherets from [```SonifyFixedDuration```](https://make4all.github.io/sonification/classes/sonification_output_SonifyFixedDuration.SonifyFixedDuration.html) and creates white noise when a ```Datum``` is passed to it.

The base class for outputs processes the data stream and calls ```start()```, ```stop()```, and ```pause()``` when there is a new ```OutputStateChange``` event. It also calls ```output(datum)``` when state is ```OutputStateChange.Playing```. Subclasses only need to implement these methods to function properly.

# Statistics
Statistics are used to calculate information about a stream, such as the maximum number seen so far, or a running average. They may be used by ```DatumOutput``` or ```DataHandler``` classes to make decisions about things (such as what range to filter over).

The base statistic class strips everything out of the stream except the number inside the ```Datum``` object, so that stats calculations can just work on pure streams of numbers, to simplify things.

Currently the only implemented statistics are:
- a ```RunningAverage```, which averages the last *n* values as follows:
```
       bufferCount(this.buffer),
                map((frames) => {
                    const total = frames.reduce((acc, curr) => {
                        acc += curr
                        return acc
                    }, 0)
                    return 1 / (total / frames.length)
                }),
```

- a ```RangeEndExpander``` which grows to always match either the largest, or smallest, data point seen so farIt uses the following code:

```
         reduce((acc, curr) => {
                    if (this.direction == GrowthDirection.Min) {
                        return curr >= acc ? acc : curr
                    } else {
                        return curr <= acc ? acc : curr
                    }
                }),
```

However we have discussed other ideas for statistics such as  an ```Extreme``` (could keep track of outliers in the data stream)

