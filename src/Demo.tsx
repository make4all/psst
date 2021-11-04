import React from "react";
import { hello, playTone } from "./sonification";
import Editor from "@monaco-editor/react";

function handleEditorChange(value: any, event: any) {
  console.log("here is the current model value:", value);
}
export const Demo = () =>
  <div>
    {hello()}
    <Editor
     height="90vh"
     defaultLanguage="javascript"
     defaultValue="// some comment"
     onChange={handleEditorChange}
   />
    <button onClick= {playTone}>play</button>
  </div>