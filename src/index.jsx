import React from 'react'
import ReactDOM from 'react-dom'
import { Demo } from './Demo'

if (module.hot) {
    module.hot.accept()
}

ReactDOM.render(<Demo />, document.getElementById('root'))
