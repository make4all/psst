import React, { FC } from 'react'
import { Link } from 'react-router-dom'

import { Demo } from './Demo'
import Jacdac from "./Jacdac"

const Index: FC = (props) => {
    const opts = [{ name: 'Basic', url: '/basic', el: <Demo /> }, { name: 'Jacdac', url: '/jacdac', el: <Jacdac /> }]

    return (
        <>
            {opts.map((opt) => (
                <Link to={opt.url}>{opt.name}</Link>
            ))}
        </>
    )
}

export default Index
