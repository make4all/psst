* Validating JSON from Vega spec. (skip)
* Loading Vega spec from string.  
* Accessing processed data – promises.
* Suggestions on interfaces for audio. Event-driven scheduling?
* Streaming data and on-demand scheduling of audio nodes.
* Connection to a Micro:bit or other sensor package; 
    
UI for sonification: Simple interface that controls audio and shows visual representations (ideally) of the incoming stream
* play/pause (button)
* Volume (slider)
* Ability to add, delete, turn on, or turn off a data stream (radio buttons or check boxes)
* Multiple data sources (streams) 
  * An ability to set ranges of “interest” (for alerts)
  * An ability to set parameters of data sources
  * set Min, Max, Label (such as a label for the data source)
  * An ability to set a renderer parameters
     * Volume (for that data source)
     * How to render (i.e. should we use pitch? Something else?) I think this could be a menu in the gui even if we are limited right now, we can still think about the gui as more flexible
    * There could be for example something very simple that ONLY uses volume, and something that uses volume and pitch, just for testing
* Possibly a visual representation of each data visualization as well
* Ability to record a trace of data 
* Selection of a sensor -- should this be a part of the interface for our library? Specifying where data should come from (e.g. which sensor, a CSV file, or a text box where you can paste in data that you got through other means)
  * Restrictions if data is being pasted from a text box. Possibly a format selector that lets users choose between CSV, TSV and JSON?
  * Selecting a vega spec for the data source 
    * Possibly parameterizing that spec.
    * Possibly being able to change this on the fly for streaming data

Larger todos:
* define scenarios (concrete) and build a few circuits? 
* visualize a single stream of data
* Set clear goals for what to build and what to evaluate


1. data processing (arquero): John
2. hook hardware (Jacdac): peli
3. sonify (Web Audio): Venkatesh buffer data, stream it.
4. UI (react, react-vega): peli+john?

* refactor into utils, etc. as examples. @peli
