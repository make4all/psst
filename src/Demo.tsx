import React, { FC, useState, useEffect } from 'react'
import { hello, playTone } from './sonification'
import Editor from '@monaco-editor/react'
import { editor } from 'monaco-editor'
import { array } from 'vega'
import Button from 'react-bootstrap/Button'
import Container from 'react-bootstrap/Container'
import DataSource from './DataSource'

//const [editorText, setEditorText] = useState('1,20,500,340,400,20,30,1000,800')
// const [data, setData] = useState<any[]>([])
// const [loading, setLoading] = useState(false)
// const [error, setError] = useState(false)

// if (module.hot) {
//     module.hot.accept()
// }


const dataSources : DataSource[] = [];
dataSources.push(new DataSource("1", "dataset 1", {"table": [
        {"x": 0, "y": 28, "c":0}, {"x": 0, "y": 20, "c":1},
        {"x": 1, "y": 43, "c":0}, {"x": 1, "y": 35, "c":1},
        {"x": 2, "y": 81, "c":0}, {"x": 2, "y": 10, "c":1},
        {"x": 3, "y": 19, "c":0}, {"x": 3, "y": 15, "c":1},
        {"x": 4, "y": 52, "c":0}, {"x": 4, "y": 48, "c":1},
        {"x": 5, "y": 24, "c":0}, {"x": 5, "y": 28, "c":1},
        {"x": 6, "y": 87, "c":0}, {"x": 6, "y": 66, "c":1},
        {"x": 7, "y": 17, "c":0}, {"x": 7, "y": 27, "c":1},
        {"x": 8, "y": 68, "c":0}, {"x": 8, "y": 16, "c":1},
        {"x": 9, "y": 49, "c":0}, {"x": 9, "y": 25, "c":1}]}));

const headerClass = "header"
const containerClass = "p-3"

const playButtonHandeler = () => {

    // for (let ds of dataSources) {
    //     let data  = ds.getData();
    //     let pitches: number[] = [];
    //     for (let datum of data["data"]) {
    //         pitches.push(datum[y])
    //     }
    //     playTone(pitches)
    // }
        // var data: number[] = []
        // var dataText: string[] = editorText.split(',')
        // for (let i = 0; i < dataText.length; i++) {
        //     data.push(parseInt(dataText[i]))
        // }
        // playTone(data)
}

const handleEditorChange: React.ChangeEventHandler<HTMLTextAreaElement> | undefined = (
        event: React.ChangeEvent<HTMLTextAreaElement>,
    ) => {
        if (event.target.value) {
            let data = JSON.parse(event.target.value)
            dataSources.push(new DataSource("user input","user data",data));
        }
    }

export default function Demo() {

    console.log(dataSources)

    return (
        
        <Container className={containerClass}>
             <h1 className={headerClass}> Basic Sonification Demo</h1> <Container>{hello()}</Container>
             <textarea value="" onChange={handleEditorChange} />
             {/* <Editor height="90vh" defaultLanguage="javascript" defaultValue={editorText} onChange={handleEditorChange} /> */}
             <Container />
             <Button onClick={playButtonHandeler}>play</Button>
                 <ul>
                     {dataSources.map((dataSource: DataSource) => (
                         dataSource.showData()
                     ))}
                </ul>
     </Container>
    )
}
// export const Demo: React.FC<Props & React.ButtonHTMLAttributes<HTMLButtonElement>> = (props) => {
//     const [editorText, setEditorText] = useState('1,20,500,340,400,20,30,1000,800')

//     const handleEditorChange: React.ChangeEventHandler<HTMLTextAreaElement> | undefined = (
//         event: React.ChangeEvent<HTMLTextAreaElement>,
//     ) => {
//         if (event.target.value) setEditorText(event.target.value)
//     }

//     return (
//         <Container className={props.containerClass}>
//             <h1 className={props.headerClass}> Basic Sonification Demo</h1> <Container>{hello()}</Container>
//             <textarea value={editorText} onChange={handleEditorChange} />
//             {/* <Editor height="90vh" defaultLanguage="javascript" defaultValue={editorText} onChange={handleEditorChange} /> */}
//             <Container />
//             <Button onClick={playButtonHandeler}>play</Button>
//             if (props.dataSources?) {}
//             {
//                 <ul>
//                     {props.dataSources.map((dataSource: DataSource) => (
//                         <li key={dataSource.key}>{dataSource.showData(props)}</li>
//                     ))}
//                 </ul>
//             }
//         </Container>
//     )
// }
