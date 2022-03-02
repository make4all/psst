import React, { FC } from 'react'
import { Link } from 'react-router-dom'


const Index: FC = (props) => {
    const opts = [
        { name: 'Basic', url: '/basic'},
        { name: 'Jacdac', url: '/jacdac'},
        { name: 'Jacdac and microbit', url: '/jacdacmicrobit'},
    ]

    return (
        <>
            {opts.map((opt) => (
                <Link to={opt.url}>{opt.name}</Link>
            ))}
        </>
    )
}

export default Index
