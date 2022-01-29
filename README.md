# sonification

The Physical computing Streaming Sonification Toolkit (PSST) is designed to simplify the authoring of  sonification of live sensor data for the purposes of understanding, testing, and debugging sensors. The toolkit is designed more generally to support authoring across different types of streaming data, but has prioritized features that will specifically be helpful when dealing with multiple sensor data streams.

## Basic Usage

We start with a simple example of how to use PSST. This example is a summary of what is done in [Jacdac.tsx](https://github.com/make4all/sonification/blob/main/src/pages/Jacdac.tsx). 
- First get an instance of [```DisplayBoard```](https://make4all.github.io/sonification/classes/sonification_displays_DisplayBoard.DisplayBoard.html) using [```DisplayBoard.getInstance()```](https://make4all.github.io/sonification/classes/sonification_displays_DisplayBoard.DisplayBoard.html#getInstance) This method enforces that there is only ever one DisplayBoard. The DisplayBoard is the repository for all data sources and their associated displays.
- Next, add a new [```DataSource```](https://make4all.github.io/sonification/classes/sonification_DataSource.DataSource.html) to the board, by calling [```board.addSource("name")```](https://make4all.github.io/sonification/classes/sonification_displays_DisplayBoard.DisplayBoard.html#addSource). 
- This [```DataSource```](https://make4all.github.io/sonification/classes/sonification_DataSource.DataSource.html) must be configured. 
   - Many displays benefit from a few statistics about the dataset it will display. In the simplest case, if known, it is valuable to add  ```max``` and ```min``` stat for the dataset. 
   - In addition, we must add a [```Template```](https://make4all.github.io/sonification/classes/sonification_templates_Template.Template.html) class which knows how to handle and potentially display the data. For example, in [```Jacdac.tsx```](https://github.com/make4all/sonification/blob/main/src/pages/Jacdac.tsx) we add a  [```NoteTemplate```](https://make4all.github.io/sonification/classes/sonification_templates_NoteTemplate.NoteTemplate.html) to this source, which will cause incoming data to be mapped into an audible range and then displayed as audible notes created using an oscillator. It is possible to add multilpe such templates to a single source. 
- Finlaly, the [```DisplayBoard```](https://make4all.github.io/sonification/classes/sonification_displays_DisplayBoard.DisplayBoard.html) must be started up, using [```board.onPlay()```](https://make4all.github.io/sonification/classes/sonification_displays_DisplayBoard.DisplayBoard.html#onPlay)

This is the initial configuration, the only remaining step is to ensure that data is being delivered. There are currently two ways to do this. in ```Jacdac.tsx``` we use the ```DisplayBoard``` to deliver data to a source declaratively, by calling [```board.pushPoint(value, sourceId)```](https://make4all.github.io/sonification/classes/sonification_displays_DisplayBoard.DisplayBoard.html#pushPoint). The alternative (seen in [DemoSimple](https://github.com/make4all/sonification/blob/main/src/views/demos/DemoSimple.tsx)) is to directly subscribe a source to an rxjs stream by calling ```setStream(source : Observer<Datum>)``` 

Displays and Templates work together. For example, a ```NoteTemplate``` will sonify incoming data as audible notes. If we also add a ```FilterRangeTemplate``` with an attached ```NoiseSonify``` display, those notes that are inside the specified range will *additionally* play white noise. 


That`s it. Add a source, configure it with one or more templates, and push data.  More details on all of this below. 

## The DisplayBoard class

The ```DisplayBoard``` class is designed to only ever have a single instance. This means that even as the user flips from one webpage to another there is still a way to keep displays running (or turn them off, or change their volume). It also handles glabel needs like pausing the audio for all data sources, generating a new data source class with a unique ID as needed, adjusting overall volume (still TBD), and pushing a new data point to a specific stream declaritively. 

## The DataSource class

Data sources are holders for a specific data source. For the most part, our current implementation assumes each ``DataSource`` class will handle only a single source of timestamped streaming numbers (specifically, streames containing the [```Datum```](https://make4all.github.io/sonification/classes/sonification_Datum.Datum.html) class.  As described above, streaming data can either be provided as an [Rxjs](https://rxjs.dev/) ```Observable``` or through a call to ```DisplayBoard.pushPoint()```.

Data sources do not record data that comes through them, however, they do have the capability to record *statistics about that data*. Specifically, one or more static values, or calculated statistics, can be added to a data source, each of which must implement the [```Calculator```](https://make4all.github.io/sonification/interfaces/sonification_stats_Calculator.Calculator.html) interface.

Data sources also have a list of [```Template```](https://make4all.github.io/sonification/modules/sonification_templates_Template.Template.html) classes which handle incoming data. Templates are described more in depth below, but they may filter data, calculate an adjusted value for data, and/or cause data to be displayed. They can be thought of as dispatch handlers for data. 

The primary role of a ```DataSource``` is to handle incoming data. When the source is not stopped, Data is handled as followed
- First the ```DataSource``` walks through each calculated statistic and updates it
- Next, the ```Datasource``` walks through each ```Template```, calling [```Template.handleDatum(Datum) : boolean```](https://make4all.github.io/sonification/classes/sonification_templates_Template.Template.html#handleDatum). If a call to ```Template.handleDatum()``` returns false, dispatch stops, otherwise dispatch continues until the end of the list of templates. 

Finally, each ```DataSource``` can ```start()``` ```stop()``` and ```pause()``` the display of data. When these methods are called, the ```DataSource``` updates its own state, and that of all of its templates. 

# Datum 
A [```Datum```](https://make4all.github.io/sonification/classes/sonification_Datum.Datum.html) is just a single item of a data stream. It knows which source it is being handled by, and has a raw value, a timestamp, and an adjusted value. Some displays may use the adjusted value instead of the raw value to decide how to render the Datum. 

# Templates 
A Template is an abstract class that is designed to handle streaming data. This happens when [```Template.handleDatum(): boolean```](https://make4all.github.io/sonification/classes/sonification_templates_Template.Template.html#handleDatum) is called. 

A ```Template``` should behave in the following ways
- It should handle data apporpriately based on its mode, whether paused, playing or stopped
- It needs to decide whether data handling is done (in which case it returns false from ```handleDatum()``` or whether it is ok for the (unknown) next ```Template``` class in the disptach order to receive the ```Datum```
- If relevant, it should display the ```Datum```.
A template may have one or more [```DatumDisplay```](https://make4all.github.io/sonification/classes/sonification_displays_DatumDisplay.DatumDisplay.html) classes which are used to render the ```Datum```. The template will loop through each, if they exist, and call ```DatumDisplay.update(Datum)```. 

In addition, ```Templates``` handle basic features such as adding and removing ```DatumDisplay``` classes and ```start()```, ```stop()``` and ```pause()```.

Some examples may help to clarify how ```Template``` classes work. 
- The [```FilterRangeTemplate```](https://make4all.github.io/sonification/classes/sonification_templates_FilterRangeTemplate.FilterRangeTemplate.html) causes data dispatch to stop if a data point is outside its specified range. Right now, this class supports only a single range with no intelligence, but more sophisticated filters could be imagined. If a display is attached to the ```FilterRangeTemplate```, it will call  ```update()``` on that display only when  the ```Datum``` is in range.
- The [```ScaleTemplate```](https://make4all.github.io/sonification/classes/sonification_templates_ScaleTemplate.ScaleTemplate.html) takes in a conversion function and uses it to modify ```Datum.adjustedValue``` for every point it sees. We subclass it in [```NoteTemplate```](https://make4all.github.io/sonification/classes/sonification_templates_NoteTemplate.NoteTemplate.html) to parameterize it with a [Mel Scale](https://en.wikipedia.org/wiki/Mel_scale) transformation. 

We haven't implemented all templates. Some additional ones that we are thinking of adding:
- *SlopeTemplate* would keep track of the the slope between data points and then assign an adjusted value on that basis. An alternative version might store the parity of the slope.

# Displays 
The same display can be used by more than one template. We currently include only displays that sonify data with nonspeech audio, though we plan to add a speech display. They all inheret from [```Sonify```](https://make4all.github.io/sonification/classes/sonification_displays_Sonify.Sonify.html), which in turn inherets from ```DatumDisplay```. We currently support the following
- [```NoteSonify```](https://make4all.github.io/sonification/classes/sonification_displays_NoteSonify.NoteSonify.html) which uses ```Datum.adjustedValue``` as a frequency for an oscillator. It plays data continuously and only stops when the data stream ends on ```stop()``` is called.
- [```NoiseSonify```](https://make4all.github.io/sonification/classes/sonification_displays_NoiseSonify.NoiseSonify.html), which inherets from [```SonifyFixedDuration```](https://make4all.github.io/sonification/classes/sonification_displays_SonifyFixedDuration.SonifyFixedDuration.html) and creates white noise when a ```Datum``` is passed to it. 

# Statistics
Currently the only implemented statistic is a ```RunningAverage```. However we have discussed other ideas for statistics such as  an ```Extreme``` (could keep track of outliers in the data stream)



