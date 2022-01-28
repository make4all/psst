import React, { lazy, Suspense } from 'react'
import ReactDOM from 'react-dom'
import { Demo } from './pages/Demo'
const Jacdac = lazy(() => import('./pages/Jacdac'))

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Index from './pages/Index'

if (module.hot) {
    module.hot.accept()
}

ReactDOM.render(
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<Index />} />
            <Route path="basic" element={<Demo />} />
            <Route
                path="jacdac"
                element={
                    <Suspense fallback={null}>
                        <Jacdac />
                    </Suspense>
                }
            />
        </Routes>
    </BrowserRouter>,
    document.getElementById('root'),
)
