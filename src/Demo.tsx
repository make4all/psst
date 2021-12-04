import React, { Ref, useState } from 'react';
import { hello} from './sonification';

import { SupportedFormats } from './constents';
import { ImportView } from './views/ImportView';
import { DataView } from './views/DataView';
import { Alert, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, InputLabel, Select, SelectChangeEvent, MenuItem } from '@mui/material';
import { DataManager } from './DataManager';

import { SonificationLevel, Sonifier } from './SonificationClass';
import { parseInput } from './sonificationUtils';
import { Readable } from 'stream';
import { IDemoView } from './views/demos/IDemoView';
import { DemoSimple } from './views/demos/DemoSimple';
import { DemoHighlightRegion } from './views/demos/DemoHighlightRegion';
import { DemoHighlightNoise } from './views/demos/DemoHighlightNoise';

const DEMO_VIEW_LIST = [
    {value: 'simple', label: 'Simple sonification'},
    {value: 'highlightNoise', label: 'Highlight points with noise'},
    {value: 'highlightRegion', label: 'Highlight points for region'},
];

export const Demo = () => {
    const [editorText, setEditorText] = useState('100,200,300,400,500,600,700,800,900,800,700,600,500,400,300,200,100,500,400,300,200,900,500,600,700,800,900,300,400,500')
    const [selectedFile, setSelectedFile] = useState<File>();
    const [isFilePicked, setIsFilePicked] = useState(false);
    
    const [fileName, setFileName] = useState<string>()
    const [demoViewValue, setDemoViewValue] = useState <string>(DEMO_VIEW_LIST[0].value);

    let demoRef = React.createRef();

     
    const handleEditorChange: React.ChangeEventHandler<HTMLTextAreaElement> | undefined= (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (event.target.value)
        setEditorText(event.target.value)
    }

    const playButtonHandeler = () => {
        // var data: number[] = []
        // var dataText: string[] = editorText.split(',')
        // console.log("sonificationOption when play button handeler is entered",sonificationOption)

        // for (let i = 0; i < dataText.length; i++) {
        //     data.push(parseInt(dataText[i]))
        // }

        let table = DataManager.getInstance().table;
        if (table) {
            // Hardcode getting the "Value" column from each data table, this will need to be set by user later
            let data = table.columns()['Value'].data;
            
            
        }  
    }

    const handelPushRudeData = () => {
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
    
    const handleDemoViewValueChange = (event: SelectChangeEvent) => {
        console.log("changed selection of demo view", event.target.value)
        setDemoViewValue(event.target.value)
    }

    let demoView;

    switch(demoViewValue) {
        case 'simple':
            demoView = (<DemoSimple />);
            break;
        case 'highlightNoise':
            demoView = (<DemoHighlightNoise />);
            break;
        case 'highlightRegion':
            demoView = (<DemoHighlightRegion />);
            break;
    }

    return (
        <div>
            <h1> basic sonification demo</h1> {hello()}
            <div>
                <ImportView />
            </div>
            
            <div>
                <DataView />
            </div>

            <div>
                <textarea value={editorText}onChange={handleEditorChange}/> 
                {/* <Editor height="90vh" defaultLanguage="javascript" defaultValue={editorText} onChange={handleEditorChange} /> */}
                <FormControl>
                    <InputLabel id="demo-view-label">Sonification Demo</InputLabel>
                    <Select
                        aria-label="Choose demo"
                        label="Sonification Demo"
                        labelId="demo-view-label"
                        value={ demoViewValue }
                        onChange={ handleDemoViewValueChange }
                        >
                        {DEMO_VIEW_LIST.map( e => (<MenuItem value={ e.value } key={ e.value }>{ e.label }</MenuItem>))}
                    </Select>
                </FormControl>
                { demoView }
                <button onClick={playButtonHandeler}>play</button>
                <p>Press the interrupt with random data button when a tone is playing to override what is playing with random data.</p>
                <button onClick={handelPushRudeData}>interrupt with random data</button>
            </div>
        </div>
    );
}
