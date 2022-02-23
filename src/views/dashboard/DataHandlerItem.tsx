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
import { DataHandlerWrapper, DataOutputTemplate, DataOutputWrapper, JDServiceWrapper } from '../../pages/Dashboard'
import DataOutputList from './DataOutputList'

import { DataHandler } from '../../sonification/handler/DataHandler'
import DataOutputItem from './DataOutputItem'

export interface DataHandlerItemProps {
    name: string
    description: string
    active: boolean
    index: number
    onRemove?: () => void
    onAddToService?: (serviceName: string, valueName: string, dataHandler: DataHandlerWrapper) => void
    handlerObject?: DataHandler
    availableServices?: JDServiceWrapper[]
    availableDataOutputs?: DataOutputTemplate[]
}

export default function DataHandlerItem(props: React.Attributes & DataHandlerItemProps): JSX.Element {
    const [addButtonAnchor, setAddButtonAnchor] = useState<null | HTMLElement>(null)
    const menuOpen = Boolean(addButtonAnchor)

    const handleAddButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAddButtonAnchor(event.currentTarget)
    }
    const handleMenuClose = () => {
        setAddButtonAnchor(null)
    }
    const handleDataOutputChange = (event: React.ChangeEvent) => {
        console.log(event)
    }

    const { active, availableServices, availableDataOutputs, onAddToService } = props

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
                                                    onAddToService?.(service.name, value.name, {
                                                        name: props.name,
                                                        description: props.description,
                                                        dataOutputs: [],
                                                    })
                                                    console.log(value.dataHandlers)
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
                                    if (props.onRemove) props.onRemove()
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
                                    {availableDataOutputs?.map((output, index) => {
                                        return (
                                            <DataOutputItem
                                                key={index}
                                                name={output.name}
                                                activated={false}
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
