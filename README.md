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

Thatis it. Add a source, configure it with one or more templates, and push data.  More details on all of this below. 

## The DisplayBoard class

The ```DisplayBoard``` class is designed to only ever have a single instance. This means that even as the user flips from one webpage to another there is still a way to keep displays running (or turn them off, or change their volume). It also handles glabel needs like pausing the audio for all data sources, generating a new data source class with a unique ID as needed, adjusting overall volume (still TBD), and pushing a new data point to a specific stream declaritively. 

## The DataSource class


### 
Call ProcessTemplates (which will do two things (1) It will possibly attach a SonificationType, and other relevant properties to the DataPoint (2) it will return true or false)
If ProcessTemplate returns false (meaning the data should be filtered) halt progress through the list
If ProcessTemplate returns true (meaning the data should be processed by the next template too) continue to next template. 
Key Methods
PushPointToSonify(DataPoint, DataSource)
Walk through the list of sonification templates to assign sonification types (see above)
MakeSound(DataPoint)
AddSonificationTemplate(SonificationTemplate, DataSource)
removeSonificationTemplate(sonificationTemplate, dataSource)
SonifyPoint(DataPoint) 
Plays data point using the template
Play/Pause (per data source?)
Volume (per data source)
Seek (currently missing)	
Buffering data (if there stream’s coming faster than it can be sonified)

Library
DataSource: A unique id (int)
DataPoint (has SonificationType attached) (see below for interface definition)
Can have multiple SonificationTypes  selected by the user interface; or could be attached by a template
toString: string -- a text description of how to speak the point. Should support syntax to use other attributes of the datapoint.
SonificationType (object hierarchy)
Tone -- optional parameters on how to sonify. Defaults will be handled by our library.
ScaledValue:number -- the value to be used when playing the tone for the point.
White Noise
Speech -- what words. Uses the toString from the point. 
SonificationTemplate 
 preferred highlight method:SonificationType
preferred non-highlight method:SonificationType
Pass in a D3 compatible function that can transform the data
Subclasses
FilterTemplate
Should always go first in the list
Should return false if data is irrelevant, causing travealse of the list to end
Should return true otherwise and not add a sonification type
HighlightRegionTemplate
RegionStart, RegionEnd fields
When it gets a datapoint, compares it to region start and region end, and either sets it as Silent, Tone, Noise, or Highlight based on those values 
ExtremeTemplate
Keeps the largest and smallest values so far
Assigns SonificationType such as highlight with noise whenever a value exceeds those extremes
SlopeTemplate
Keep parity of slope
Whenever the slope parity changes, assign Highlight Noise
Smoothness Template
Keep average change in y 
Whenever the change in y is > 1 std deviation larger than that average, Highlight Noise
ConvertValueLinearlyToTone
….



Data structure and interface definitions
Point
interface Point{ // this lets us use point as a datatype in typescript.
    value: number;

    Priority: SonificationLevel;
    sonificationType: SonificationType[]; 
    toString: string;
}

Template interface
Interface template {
Name:string // a user-readable name of the template.
highlight:SonificationType // preferred sonification parameters to highlight a point with.
non-highlight:SonificationType // preferred way to not highlight a point.
highlightCondition: function(value:number) -> bool // if true, apply highlight sonification type.
non-highlightCondition?: function(value:number) -> bool // if optional function is defined and returns true, apply non-highlight sonification type.
Transformation? function(value:number) -> number // optional function to transform the live data we see.
Filter? function(value:number) -> bool // if this method exists and returns false, data processing will stop.
apply(point:Point) -> Point // applies the templates and returns the point to be sonified.
}

sonificationType
Interface SonificationType{
Type: enum{Audio, speech, noise} // which sonification parameter to change?
Volume:number // the base volume of the sonification.
}



Class tone implements SonificationType{
Private _Type: Audio
Public get type {
Return _type
}
Public value:number
Public duration: number
Private _Param: enum{frequency, volume, pan} // the audio parameter to change.
Public get param{
Return _param
}
Public duration: number;
// constructur sets defaults
}

Class noise implements SonificationType {
Private _Type: Audio
Public get type {
Return _type
}
Public duration: number
Private _Param: enum{frequency, volume, pan} // the audio parameter to change.
Public get param{
Return _param
}
Public duration: number;
Private _noiseType: enum{white}

// constructur sets defaults
}

Class speech implements SonificationTYpe {
Private _Type:Speech 
Public get type {
Return _type
}
Private _spokenText:string
Public get spoken text{
Return _spokenText
}

//constructor sets spokenText.
}


Jen’s notes from 1/6/22
User gets instance of sonifier.
SonifyPushPoint(number, level) 
“reset”
Store data
“Fire timer”
Creates an audio node (based on type of noise)
Connects it to the destination (speaker)
Tells the node when to start and when to stop playing
This is currently not realtime.



What does the data input loop look like for realtime data?
(assume) SonifyPushPoint pushes a point onto a queue
In some thread, there is a loop
(1) checks the queue
(2) If the queue is long, it run a queueShortenerObject on the queue
By default, this randomly picks a point from the queue and deletes everything else
Other options are to average the queue, pick the first or last point, median, etc
(3) Pass the object “out” of the thread to a separate deliver thread
Delivery thread handles all of the template stuff and plays the note
Waits until millisecond is over
Loops back up 

What does the data input loop look like for non realtime data?
(assume) SonifyPushPoint pushes a point onto a queue
In some thread, there is a loop
(1) take the next thing off the queue
(2) Pass the object “out” of the thread to a separate deliver thread
Delivery thread handles all of the template stuff and plays the note
Waits until N millisecond is over (N is a parameter)
Loops back up 



