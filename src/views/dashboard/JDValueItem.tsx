import { useState, useEffect } from 'react'

import { Box, Button, Card, CardContent, CardHeader, Grid, Menu, MenuItem, Typography } from '@mui/material'
import { ArrowDropDown } from '@mui/icons-material'

import { DataHandlerWrapper } from '../../pages/templates/DataHandlerInterfaces'

import DataHandlerItem from './DataHandlerItem'

import { REPORT_UPDATE, throttle, JDRegister } from 'jacdac-ts'

export interface JDValueItemProps {
    name: string
    id: string
    index: number
    units: string
    format: (value: number) => string
    register: JDRegister
    dataHandlers: DataHandlerWrapper[]
    currentHandlerTemplates: DataHandlerWrapper[]
    onDataHandlerChange?: (add: boolean, handler: DataHandlerWrapper) => void
    onParameterChange?: () => void
}

export default function JDValueItem(props: React.Attributes & JDValueItemProps): JSX.Element {
    const handlersExist = props.dataHandlers.length !== 0

    const [addButtonAnchor, setAddButtonAnchor] = useState<null | HTMLElement>(null)
    const [currentValue, setCurrentValue] = useState<string>('0')
    const menuOpen = Boolean(addButtonAnchor)

    useEffect(() => {
        props.register.subscribe(
            REPORT_UPDATE,
            throttle(async () => {
                const raw = props.register.unpackedValue[props.index]
                setCurrentValue(props.format(raw))
            }, 100),
        )
    }, [props.register])

    const handleAddButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAddButtonAnchor(event.currentTarget)
    }
    const handleMenuClose = () => {
        setAddButtonAnchor(null)
    }

    const { currentHandlerTemplates, name, units, onDataHandlerChange, onParameterChange } = props

    return (
        <Grid item xs={12} sm={handlersExist ? 12 : 6} md={handlersExist ? 12 : 4}>
            <Card>
                <CardHeader
                    title={
                        <Box>
                            <Typography sx={{ mr: 1 }} variant="subtitle1" component="span">
                                {name}
                            </Typography>
                            <Typography variant="h5" component="span">
                                {currentValue}
                            </Typography>
                            <Typography sx={{ ml: 1 }} variant="subtitle1" component="span">
                                {units}
                            </Typography>
                        </Box>
                    }
                    action={
                        <Box>
                            <Button
                                id="btn-value-add-handler"
                                aria-controls={menuOpen ? 'menu-value-handler-list' : undefined}
                                aria-haspopup="true"
                                aria-expanded={menuOpen ? 'true' : undefined}
                                variant="contained"
                                onClick={handleAddButtonClick}
                                endIcon={<ArrowDropDown />}
                            >
                                Add Handler
                            </Button>
                            <Menu
                                open={menuOpen}
                                onClose={handleMenuClose}
                                anchorEl={addButtonAnchor}
                                id="menu-value-handler-list"
                            >
                                {currentHandlerTemplates.map((template) => (
                                    <MenuItem
                                        key={template.id}
                                        onClick={() => {
                                            onDataHandlerChange?.(true, { ...template })
                                            handleMenuClose()
                                        }}
                                    >
                                        {template.name}
                                    </MenuItem>
                                ))}
                            </Menu>
                        </Box>
                    }
                />
                {props.dataHandlers.length === 0 ? undefined : (
                    <CardContent>
                        <Grid container spacing={1}>
                            {props.dataHandlers.map((dataHandler, index) => (
                                <DataHandlerItem
                                    {...dataHandler}
                                    active={true}
                                    key={dataHandler.id}
                                    onParameterChange={onParameterChange}
                                    onRemove={() => {
                                        onDataHandlerChange?.(false, dataHandler)
                                    }}
                                />
                            ))}
                        </Grid>
                    </CardContent>
                )}
            </Card>
        </Grid>
    )
}
