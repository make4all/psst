import { useState, useEffect } from 'react'
import { FileCopy } from '@mui/icons-material'
import {
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    FormControl,
    FormGroup,
    FormLabel,
    Grid,
    InputLabel,
    Menu,
    MenuItem,
    NativeSelect,
    Typography,
    IconButton,
    TextField,
} from '@mui/material'
import { ArrowDropDown } from '@mui/icons-material'

import { grey } from '@mui/material/colors'
import { DataHandlerWrapper, DataOutputWrapper, JDServiceWrapper, ParameterWrapper } from '../../pages/Dashboard'

import { DataHandler } from '../../sonification/handler/DataHandler'
import DataOutputItem from './DataOutputItem'
import ParameterItem from './ParameterItem'
import { OutputEngine } from '../../sonification/OutputEngine'

export interface DataHandlerItemProps {
    name: string
    description: string
    dataOutputs: DataOutputWrapper[]
    active: boolean
    onRemove?: () => void
    onAddToService?: (add: boolean, serviceId: string, valueId: string, template: DataHandlerWrapper) => void
    onParameterChange?: () => void
    parameters?: ParameterWrapper[]
    createHandler: (domain: [number, number]) => DataHandler
    handlerObject?: DataHandler
    availableServices?: JDServiceWrapper[]
}

export default function DataHandlerItem(props: React.Attributes & DataHandlerItemProps): JSX.Element {
    const [addButtonAnchor, setAddButtonAnchor] = useState<null | HTMLElement>(null)
    const [dataOutputs, setDataOutputs] = useState<DataOutputWrapper[]>(props.dataOutputs)
    const menuOpen = Boolean(addButtonAnchor)
    const [n, setN] = useState('1')
    const [t, setT] = useState('0')

    const handleNChange = (event) => {
        setN(event.target.value)
    }

    const handleTChange = (event) => {
        setT(event.target.value)
    }

    const handleAddButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAddButtonAnchor(event.currentTarget)
    }
    const handleMenuClose = () => {
        setAddButtonAnchor(null)
    }

    const handleCopyButtonClick = () => {
        OutputEngine.getInstance().printCopyMap()
        OutputEngine.getInstance().copyToClipboard(Number(n), Number(t))
    }

    const handleDataOutputChange = (name: string, activated: boolean) => {
        console.log(name, activated)

        const dataOutputsCopy = dataOutputs.map((output) => {
            if (output.name === name) {
                if (activated) {
                    output.outputObject = output.createOutput()
                    props.handlerObject?.addOutput(output.outputObject)
                } else if (output.outputObject) {
                    props.handlerObject?.removeOutput(output.outputObject)
                    output.outputObject = undefined
                }
            }
            return { ...output }
        })
        setDataOutputs(dataOutputsCopy)
        props.onParameterChange?.()
    }

    const { active, availableServices, onAddToService, onRemove } = props

    return (
        <Grid item md={6} sm={12} xs={12}>
            <Card
                elevation={active ? 0 : 1}
                sx={{
                    border: '2px solid',
                    borderColor: grey[200],
                }}
            >
                <CardHeader
                    sx={{ bgcolor: grey[200] }}
                    title={
                        <Typography variant="subtitle1" component="span">
                            {props.name}
                        </Typography>
                    }
                    action={
                        !active && availableServices ? (
                            <Box>
                                <IconButton aria-label="Copy" onClick={handleCopyButtonClick}>
                                    <FileCopy />
                                </IconButton>
                                <Button
                                    id="btn-data-handler-add-to-stream"
                                    aria-controls={menuOpen ? 'menu-data-handler-stream-list' : undefined}
                                    aria-haspopup="true"
                                    aria-expanded={menuOpen ? 'true' : undefined}
                                    variant="contained"
                                    onClick={handleAddButtonClick}
                                    endIcon={<ArrowDropDown />}
                                >
                                    Choose Sensor to Add
                                </Button>
                                <Menu
                                    open={menuOpen}
                                    onClose={handleMenuClose}
                                    anchorEl={addButtonAnchor}
                                    id="menu-data-handler-stream-list"
                                >
                                    {availableServices.map((service) =>
                                        service.values.map((value) => (
                                            <MenuItem
                                                key={value.id}
                                                onClick={() => {
                                                    onAddToService?.(true, service.id, value.id, {
                                                        name: props.name,
                                                        id: `${props.name}-${Math.floor(Math.random() * Date.now())}`,
                                                        description: props.description,
                                                        dataOutputs: dataOutputs,
                                                        parameters: props.parameters,
                                                        createHandler: props.createHandler,
                                                    })
                                                    handleMenuClose()
                                                }}
                                            >
                                                {(service.values.length > 1 ? `${value.name} - ` : '') + service.name}
                                            </MenuItem>
                                        )),
                                    )}
                                </Menu>
                            </Box>
                        ) : (
                            <Button
                                variant="outlined"
                                onClick={() => {
                                    onRemove?.()
                                }}
                            >
                                Remove
                            </Button>
                        )
                    }
                />
                <CardContent sx={{ minHeight: 140 }}>
                    <Grid container spacing={1}>
                        <Grid item xs={6} lg={8}>
                            <Typography variant="body2">{props.description}</Typography>
                            <div>
                                {props.parameters?.map((parameter) => {
                                    return (
                                        <ParameterItem key={parameter.name} {...parameter} obj={props.handlerObject} />
                                    )
                                })}
                            </div>
                            <div>
                                {dataOutputs?.map((output) => {
                                    return output.parameters?.map((parameter) => {
                                        return (
                                            <ParameterItem
                                                key={parameter.name}
                                                {...parameter}
                                                obj={output.outputObject}
                                            />
                                        )
                                    })
                                })}
                            </div>
                        </Grid>
                        <Grid item xs={6} lg={4}>
                            <FormControl component="fieldset" sx={{ float: 'right' }}>
                                <TextField
                                    id="input-n"
                                    label="Input N"
                                    variant="outlined"
                                    value={n}
                                    onChange={handleNChange}
                                    type="number"
                                    sx={{ marginTop: 2 }}
                                />
                                <TextField
                                    id="input-t"
                                    label="Input T"
                                    variant="outlined"
                                    value={t}
                                    onChange={handleTChange}
                                    type="number"
                                    sx={{ marginTop: 2 }}
                                />
                                <FormLabel component="legend">Choose Data Outputs</FormLabel>
                                <FormGroup>
                                    {dataOutputs?.map((output) => {
                                        return (
                                            <DataOutputItem
                                                key={output.id}
                                                name={output.name}
                                                outputObject={output.outputObject}
                                                createOutput={output.createOutput}
                                                activated={!!output.outputObject}
                                                onChange={handleDataOutputChange}
                                            />
                                        )
                                    })}
                                </FormGroup>
                            </FormControl>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </Grid>
    )
}
