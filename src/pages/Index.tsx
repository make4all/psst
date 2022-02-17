import React, { FC } from 'react'
import { Link } from 'react-router-dom'

import { Demo } from './Demo'
import Jacdac from './Jacdac'
import { Dashboard } from './Dashboard'

const Index: FC = (props) => {
    const opts = [
        { name: 'Basic', url: '/basic', el: <Demo /> },
        { name: 'Jacdac', url: '/jacdac', el: <Jacdac /> },
        { name: 'Dashboard', url: '/dashboard', el: <Dashboard /> },
    ]

    return (
        <>
            <ul>
                {opts.map((opt) => (
                    <li>
                        <Link to={opt.url}>{opt.name}</Link>
                    </li>
                ))}
            </ul>
        </>
    )
}

export default Index
