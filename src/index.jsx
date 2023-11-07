import React, { lazy, Suspense } from 'react'
import ReactDOM from 'react-dom'
import { Demo } from './pages/Demo'
const Jacdac = lazy(() => import('./pages/Jacdac'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const MicrobitController = lazy(() => import('./pages/MicrobitController'))
const App = lazy(() => import('./chat-gpt/components/App/App.tsx'))

import { HashRouter, Routes, Route } from 'react-router-dom'
import Index from './pages/Index'

if (module.hot) {
    module.hot.accept()
}
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true }
    }

    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service
        console.log(error, errorInfo)
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return <h1>Something went wrong.</h1>
        }

        return this.props.children
    }
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
            <Route
                path="chat"
                element={
                    <Suspense fallback={null}>
                        <ErrorBoundary>
                            <App />
                        </ErrorBoundary>
                    </Suspense>
                }
            />
        </Routes>
    </HashRouter>,
    document.getElementById('root'),
)
