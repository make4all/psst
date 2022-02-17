import { FormControl, FormLabel, FormGroup, Switch } from '@mui/material'

import { ChangeEvent, ChangeEventHandler } from 'react'
import DataOutputItem from './DataOutputItem'

export interface DataOutputListProps {
    dataOutputs: any[]
}

export default function DataOutputList(props: React.Attributes & DataOutputListProps): JSX.Element {
    const handleChange = (event: ChangeEvent) => {
        console.log(event)
    }

    return (
        <FormControl component="fieldset" sx={{float: 'right'}}>
            <FormLabel component="legend">Choose Data Outputs</FormLabel>
            <FormGroup>
                {props.dataOutputs.map((output, index) => {
                    return <DataOutputItem key={index} name={output.name} activated={false} onChange={handleChange} />
                })}
            </FormGroup>
        </FormControl>
    )
}
