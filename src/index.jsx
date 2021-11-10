import React from 'react'
import ReactDOM from 'react-dom'
import Demo from './Demo'
import 'bootstrap/dist/css/bootstrap.min.css'
//import 'https://cdn.jsdelivr.net/npm/vega@5'
//import 'https://cdn.jsdelivr.net/npm/vega-lite@4'
//import 'https://cdn.jsdelivr.net/npm/vega-embed@6.20.0/build/vega-embed.min.js'

if (module.hot) {
    module.hot.accept();
};

ReactDOM.render(<Demo />, document.getElementById('root'));
