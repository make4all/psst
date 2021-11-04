import React from "react"
import { hello, playTone } from "./sonification"

export const Demo = () =>
  <div>
    {hello()}
    <button onClick= {playTone}>play</button>
  </div>