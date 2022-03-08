import { FormControlLabel, Switch } from '@mui/material'

import { DataOutputWrapper } from '../../pages/Dashboard'
import { DatumOutput } from '../../sonification/output/DatumOutput'

export interface DataOutputProps {
    name: string
    createOutput: () => DatumOutput
    outputObject?: DatumOutput
    activated: boolean
    onChange: (name: string, activated: boolean) => void
}

export default function DataOutputItem(props: React.Attributes & DataOutputProps): JSX.Element {
    const { name, createOutput, outputObject } = props
    return (
        <FormControlLabel
            control={
                <Switch
                    checked={props.activated}
                    onChange={() => props.onChange(name, !props.activated)}
                    name={props.name}
                />
            }
            label={props.name}
        />
    )
}
