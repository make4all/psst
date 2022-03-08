import { useState, useEffect } from 'react'

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
    Menu,
    MenuItem,
    Typography,
} from '@mui/material'
import { ArrowDropDown } from '@mui/icons-material'

import { grey } from '@mui/material/colors'
import { DataHandlerWrapper, DataOutputWrapper, JDServiceWrapper } from '../../pages/Dashboard'

import { DataHandler } from '../../sonification/handler/DataHandler'
import DataOutputItem from './DataOutputItem'

export interface DataHandlerItemProps {
    name: string
    description: string
    dataOutputs: DataOutputWrapper[]
    active: boolean
    index: number
    onRemove?: () => void
    onAddToService?: (add: boolean, serviceName: string, valueName: string, template: DataHandlerWrapper) => void
    onParameterChange?: () => void
    createHandler: () => DataHandler
    handlerObject?: DataHandler
    availableServices?: JDServiceWrapper[]
}

export default function DataHandlerItem(props: React.Attributes & DataHandlerItemProps): JSX.Element {
    const [addButtonAnchor, setAddButtonAnchor] = useState<null | HTMLElement>(null)
    const [dataOutputs, setDataOutputs] = useState<DataOutputWrapper[]>(props.dataOutputs)
    const menuOpen = Boolean(addButtonAnchor)

    const handleAddButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAddButtonAnchor(event.currentTarget)
    }
    const handleMenuClose = () => {
        setAddButtonAnchor(null)
    }

    const handleDataOutputChange = (name: string, activated: boolean) => {
        console.log(name, activated)

        const dataOutputsCopy = dataOutputs.map((output) => {
            if (output.name == name) {
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
                                <Button
                                    id="btn-data-handler-add-to-stream"
                                    aria-controls={menuOpen ? 'menu-data-handler-stream-list' : undefined}
                                    aria-haspopup="true"
                                    aria-expanded={menuOpen ? 'true' : undefined}
                                    variant="contained"
                                    onClick={handleAddButtonClick}
                                    endIcon={<ArrowDropDown />}
                                >
                                    Add to Stream
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
                                                onClick={() => {
                                                    onAddToService?.(true, service.name, value.name, {
                                                        name: props.name,
                                                        description: props.description,
                                                        dataOutputs: dataOutputs,
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
                        <Grid item xs={6}>
                            <Typography variant="body2">{props.description}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl component="fieldset" sx={{ float: 'right' }}>
                                <FormLabel component="legend">Choose Data Outputs</FormLabel>
                                <FormGroup>
                                    {dataOutputs?.map((output, index) => {
                                        return (
                                            <DataOutputItem
                                                key={output.name + index}
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
