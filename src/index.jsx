import React, { lazy, Suspense } from 'react'
import ReactDOM from 'react-dom'
import { Demo } from './pages/Demo'
const Jacdac = lazy(() => import('./pages/Jacdac'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const MicrobitController = lazy(() => import('./pages/MicrobitController'))

import { HashRouter, Routes, Route } from 'react-router-dom'
import Index from './pages/Index'

if (module.hot) {
    module.hot.accept()
}

ReactDOM.render(
    <HashRouter>
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
            <Route
                path="jacdacmicrobit"
                element={
                    <Suspense fallback={null}>
                        <MicrobitController />
                    </Suspense>
                }
            />
            <Route
                path="dashboard"
                element={
                    <Suspense fallback={null}>
                        <Dashboard />
                    </Suspense>
                }
            />
        </Routes>
    </HashRouter>,
    document.getElementById('root'),
)
