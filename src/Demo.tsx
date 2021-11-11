import { Alert } from '@material-ui/lab'; // using alerts for quick debugging. going to the console for everything is too many key presses!
import React, { useState } from 'react'
import { hello, parseInput, playTone } from './sonification'

import { SupportedFormats } from './constents';
export const Demo = () => {
    const [editorText, setEditorText] = useState('1,20,500,340,400,20,30,1000,800')
    const [selectedFile, setSelectedFile] = useState<File>();
    const [isFilePicked, setIsFilePicked] = useState(false);
    const [fileName, setFileName] = useState<string>()
    const handleEditorChange: React.ChangeEventHandler<HTMLTextAreaElement> | undefined= (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (event.target.value)
        setEditorText(event.target.value)
    }

    const playButtonHandeler = () => {
        var data: number[] = []
        var dataText: string[] = editorText.split(',')
        for (let i = 0; i < dataText.length; i++) {
            data.push(parseInt(dataText[i]))
        }
        playTone(data)
    }

    return (<div>
        <h1> basic sonification demo</h1> {hello()}
        <textarea value={editorText}onChange={handleEditorChange}/> 
        {/* <Editor height="90vh" defaultLanguage="javascript" defaultValue={editorText} onChange={handleEditorChange} /> */}
        <button onClick={playButtonHandeler}>play</button>
        <input type="file" name="file" accept = "csv" onChange={(e) => {
            if(e.target.files && e.target.files[0].name   )
            setSelectedFile(e.target.files[0]);
            setFileName(selectedFile?.name)
            setIsFilePicked(true)
            var rawData = parseInput(fileName,SupportedFormats.CSV);

        }} />
        {isFilePicked ? (<Alert>{selectedFile?.name}</Alert>) : (<p>Please upload a CSV file </p>)}
    </div>)
}
