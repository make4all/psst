import React from "react";
import { hello, playTone } from "./sonification";
import Editor from "@monaco-editor/react";
import { editor } from "monaco-editor";
import { array } from "vega";
let editorText:string = "1,20,500,340,400,20,30,1000,800";
function handleEditorChange(value: any, event: any) {
  // console.log("here is the current model value:", value);
  editorText = value;
}

function playButtonHandeler(){
  var data: number[] = [];
  var dataText:string[] = editorText.split(",");
  for(let i=0;i<dataText.length;i++){
    data.push(parseInt(dataText[i]));
  }
  playTone(data);
} 
export const Demo = () =>
  <div>
    <h1> basic sonification demo</h1>    {hello()}
    <Editor
     height="90vh"
     defaultLanguage="javascript"
     defaultValue={editorText}
     onChange={handleEditorChange}
   />
    <button onClick= {playButtonHandeler}>play</button>
  </div>