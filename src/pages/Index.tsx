import React, { FC } from 'react'
import { Link } from 'react-router-dom'

const Index: FC = (props) => {
    const opts = [
        { name: 'Basic', url: '/basic' },
        { name: 'Jacdac', url: '/jacdac' },
        { name: 'Jacdac and microbit', url: '/jacdacmicrobit' },
        { name: 'Dashboard', url: '/dashboard' },
    ]

    return (
        <>
            <ul>
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
