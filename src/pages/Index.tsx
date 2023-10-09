import React, { FC } from 'react'
import { Link } from 'react-router-dom'

const Index: FC = (props) => {
    const opts = [
        { name: 'Basic', url: '/basic' },
        { name: 'Jacdac', url: '/jacdac' },
        { name: 'Jacdac and microbit', url: '/jacdacmicrobit' },
        { name: 'Dashboard', url: '/dashboard' },
        { name: 'Demo Copy', url: '/democopy' },
    ]

    return (
        <>
            <h1>Physical Computing Streaming Sensor Tooltip (PSST)</h1>
            <p>
                The Physical computing Streaming Sensor Sonification Toolkit (PSSST) is designed to simplify the
                authoring of sonification of live sensor data for the purposes of understanding, testing, and debugging
                sensors. The toolkit is designed more generally to support authoring across different types of streaming
                data, but has prioritized features that will specifically be helpful when dealing with multiple sensor
                data streams.
            </p>
            <h2>Tools</h2>
            <ul>
                <li>
                    <a href="https://github.com/make4all/psst">GitHub repository</a>
                </li>
                {opts.map((opt) => (
                    <li key={opt.url}>
                        <Link to={opt.url}>{opt.name}</Link>
                    </li>
                ))}
            </ul>
        </>
    )
}

export default Index
