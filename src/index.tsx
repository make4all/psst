import React from 'react'
import ReactDOM from 'react-dom'

import { hello } from "./sonification"

const Demo = () =>
  <div>
    {hello()}
  </div>

ReactDOM.render(
  <Demo />,
  document.getElementById('root')
)