import { FormControl, InputLabel, NativeSelect, TextField } from '@mui/material'
import { useState, useEffect } from 'react'
import { DataHandler } from '../../sonification/handler/DataHandler'
import { DatumOutput } from '../../sonification/output/DatumOutput'

export interface ParameterItemProps {
    name: string
    type: string
    default?: number
    values?: { display: string; value: number }[]
    obj?: DataHandler | DatumOutput
    handleUpdate: (value: number, obj?: DataHandler | DatumOutput) => void
}

export default function ParameterItem(props: React.Attributes & ParameterItemProps): JSX.Element {
    const [value, setValue] = useState<number | undefined>(props.default)

    const { name, values } = props

    return (
        <div>
            {props.type === 'list' ? (
                <FormControl>
                    <InputLabel variant="standard" htmlFor="demo-view-select" id="demo-view-label">
                        {name}
                    </InputLabel>
                    <NativeSelect
                        aria-label="Choose demo"
                        id="demo-view-select"
                        value={value}
                        onChange={(e) => {
                            const newValue = +e.target.value
                            props.handleUpdate(newValue, props.obj)
                            setValue(newValue)
                        }}
                    >
                        {values?.map((e) => (
                            <option value={e.value} key={e.value}>
                                {e.display}
                            </option>
                        ))}
                    </NativeSelect>
                </FormControl>
            ) : (
                <TextField
                    id={`text-${name}-value`}
                    aria-label={`${name} value`}
                    label={name}
                    variant="outlined"
                    size="small"
                    type="number"
                    value={value}
                    onChange={(e) => {
                        const newValue = +e.target.value
                        props.handleUpdate(newValue, props.obj)
                        setValue(newValue)
                    }}
                />
            )}
        </div>
    )
}
