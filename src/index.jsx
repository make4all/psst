import React from 'react'
import ReactDOM from 'react-dom'
import { Demo } from './pages/Demo'

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from './pages/Index';


if (module.hot) {
    module.hot.accept()
}

ReactDOM.render(<BrowserRouter>
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="basic" element={<Demo />} />
    </Routes>
</BrowserRouter>, document.getElementById('root'))
