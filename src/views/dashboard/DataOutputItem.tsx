import {
    FormControlLabel,
    Switch,
} from '@mui/material'

import { ChangeEventHandler } from 'react'

export interface DataOutputProps {
    name: string
    activated: boolean
    onChange: ChangeEventHandler
}

export default function DataOutputItem(props: React.Attributes & DataOutputProps): JSX.Element {
    return (
        <FormControlLabel
            control={<Switch checked={props.activated} onChange={props.onChange} name={props.name} />}
            label={props.name}
        />
    )
}
