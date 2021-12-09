import React, {FC} from 'react'
import { Link } from "react-router-dom";

import { Demo } from './Demo'

const Index: FC = props => {

    const opts = [
        {name: 'Basic', url:'/basic', el:<Demo/>}
    ]

    return (<>
        {opts.map(opt => <Link to={opt.url}>{opt.name}</Link>)}
    </>)
}

export default Index