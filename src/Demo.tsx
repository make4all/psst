
import {Sonifier } from './sonifier'


import React from 'react';






import { PlaybackState, SonificationLevel } from './constents';
import { ImportView } from './views/ImportView';
import { DataView } from './views/DataView';

import { FormControl, InputLabel, Select, SelectChangeEvent, MenuItem, Grid } from '@mui/material';
import { DataManager } from './DataManager';


import { IDemoView } from './views/demos/IDemoView';
import { DemoSimple } from './views/demos/DemoSimple';
import { DemoHighlightRegion } from './views/demos/DemoHighlightRegion';
import { DemoHighlightNoise } from './views/demos/DemoHighlightNoise';
import { op } from 'arquero';

const DEMO_VIEW_MAP = {
    simple: {value: 'simple', label: 'Simple sonification', component: DemoSimple},
    highlightNoise: {value: 'highlightNoise', label: 'Highlight points with noise', component: DemoHighlightNoise},
    highlightRegion: {value: 'highlightRegion', label: 'Highlight points for region', component: DemoHighlightRegion},
};

let demoViewRef: React.RefObject<DemoSimple | DemoHighlightNoise | DemoHighlightRegion> = React.createRef();
export interface DemoState {
    dataSummary: any;
    demoViewValue: string;
    playbackLabel:string;
};

export interface DemoProps {
    
};

export class Demo extends React.Component<DemoProps, DemoState> {
    constructor(props: DemoProps) {
        super(props);
        this.state = {
            dataSummary: {min: 300, max: 500, median: 400, mean: 400, count: 200},
            demoViewValue: 'simple',
            playbackLabel: 'play',
        };

        DataManager.getInstance().addListener(this._handleDataChange);

    }

    public render() {
        const { demoViewValue, dataSummary, playbackLabel } = this.state;

        const DemoComponent = DEMO_VIEW_MAP[demoViewValue].component;

        return (
            <div>
                <h1> basic sonification demo</h1> 
                <div>
                    <ImportView />
                </div>
                
                <div>
                    <DataView />
                </div>
    
                <div style={{ marginTop: "20px" }}>
                    {/* <textarea value={editorText}onChange={handleEditorChange}/>  */}
                    {/* <Editor height="90vh" defaultLanguage="javascript" defaultValue={editorText} onChange={handleEditorChange} /> */}
                    <Grid container spacing={2}>
                        <Grid item xs={8} sm={4} md={4}>
                            <FormControl>
                                <InputLabel id="demo-view-label">Sonification Demo</InputLabel>
                                <Select
                                    aria-label="Choose demo"
                                    label="Sonification Demo"
                                    labelId="demo-view-label"
                                    value={ demoViewValue }
                                    onChange={ this._handleDemoViewValueChange }
                                    >
                                    {Object.values(DEMO_VIEW_MAP).map( e => (<MenuItem value={ e.value } key={ e.value }>{ e.label }</MenuItem>))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={8} md={8}>
                            { < DemoComponent ref={ demoViewRef } dataSummary={ dataSummary } /> }
                        </Grid>
                    </Grid>
                    
                    
                    <button onClick={ this._handlePlayButton }>{ playbackLabel }</button>
                    <p>Press the interrupt with random data button when a tone is playing to override what is playing with random data.</p>
                    <button onClick={ this._handlePushRudeData }>interrupt with random data</button>
                </div>
            </div>
        );
    }

    private _handleDataChange = (data: any) => {
        // setDataTable(data);

        let dataSummary = data.rollup({
            mean: d => op.mean(d.Value),
            min: d => op.min(d.Value),
            max: d => op.max(d.Value),
            median: d => op.median(d.Value),
            count: d => op.count(),
        }).object();
        console.log(dataSummary);

        this.setState({ dataSummary });
    };

    private _handlePlayButton = () => {
        // This is old code for getting the data values from a TextEdit HTML element
        // var data: number[] = []
        // var dataText: string[] = editorText.split(',')
        // console.log("sonificationOption when play button handeler is entered",sonificationOption)

        // for (let i = 0; i < dataText.length; i++) {
        //     data.push(parseInt(dataText[i]))
        // }
        const sonifierInstance = Sonifier.getSonifierInstance();
        
        if (sonifierInstance) {
            console.log('sonifier instance is present. playback state', sonifierInstance.playbackState);
            if (
                sonifierInstance.playbackState == PlaybackState.Paused ||
                sonifierInstance.playbackState == PlaybackState.Playing
            ) {
                sonifierInstance.pauseToggle();
                return;
            }
            if (sonifierInstance.playbackState == PlaybackState.Stopped) {
                sonifierInstance.onPlaybackStateChanged = this._handlePlaybackStateChanged;
            }
        }

        let table = DataManager.getInstance().table;

        if (table) {
            // Hardcode getting the "Value" column from each data table, this will need to be set by user later
            let data = table.columns()['Value'].data;

            if (demoViewRef.current) {
                let demoView: IDemoView = demoViewRef.current;
                demoView.onPlay(data);
            }
        }
    }

    private _handlePlaybackStateChanged = (e: PlaybackState) => {
        console.log('handlePlaybackStateChanged', e);
        let playbackLabel;
        switch(e) {
            case PlaybackState.Playing:
                playbackLabel = 'pause';
                break;
            case PlaybackState.Paused:
                playbackLabel = 'resume';
                break;
            default:
                playbackLabel = 'play';
                break;
        }
        this.setState({ playbackLabel });

        console.log('returning. play button label', playbackLabel);
    }

    private _handlePushRudeData = () => {
        let sonifierInstance  = Sonifier.getSonifierInstance();
        if(sonifierInstance)
        {
        for(let i=0;i<5;i++) {
                let dataPoint:number = Math.random()
                dataPoint = dataPoint*10000;
                sonifierInstance.SonifyPushedPoint(dataPoint,SonificationLevel.rude)
            }
        }
    }
    
    private _handleDemoViewValueChange = (event: SelectChangeEvent) => {
        console.log("changed selection of demo view", event.target.value)
        let demoViewValue = event.target.value;
        this.setState({ demoViewValue });
    }


}
