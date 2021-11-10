import React, { TextareaHTMLAttributes, useState } from 'react'
import { hello, playTone } from './sonification'
import Editor from '@monaco-editor/react'
import { editor } from 'monaco-editor'
import { array } from 'vega'

export const Demo = () => {
    const [editorText, setEditorText] = useState('1,20,500,340,400,20,30,1000,800')

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
    </div>)
}
