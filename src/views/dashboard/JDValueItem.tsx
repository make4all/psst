import { useState, useEffect } from 'react'

import { Box, Button, Card, CardContent, CardHeader, Grid, Menu, MenuItem, Typography } from '@mui/material'
import { ArrowDropDown } from '@mui/icons-material'
import { DataHandlerTemplate, DataHandlerWrapper } from '../../pages/Dashboard'

import DataHandlerItem from './DataHandlerItem'

import {
    JDBus,
    JDDevice,
    SRV_ACCELEROMETER,
    REPORT_UPDATE,
    throttle,
    startDevTools,
    inIFrame,
    JDRegister,
} from 'jacdac-ts'

export interface JDValueItemProps {
    name: string
    register: JDRegister
    dataHandlers: DataHandlerWrapper[]
    currentHandlerTemplates: DataHandlerTemplate[]
    onRemoveDataHandler?: (handlerName: string) => void
    onAddDataHandler?: (template: DataHandlerTemplate) => void
    availableDataHandlers?: DataHandlerTemplate[]
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
                const [raw] = props.register.unpackedValue
                console.log(raw)
                setCurrentValue(raw)
            }, 100),
        )
    }, [props.register])
    

    const handleAddButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAddButtonAnchor(event.currentTarget)
    }
    const handleMenuClose = () => {
        setAddButtonAnchor(null)
    }

    const { currentHandlerTemplates, name, onAddDataHandler, onRemoveDataHandler } = props

    return (
        <Grid item xs={12} sm={handlersExist ? 12 : 6} md={handlersExist ? 12 : 4}>
            <Card>
                <CardHeader
                    title={
                        <Typography variant="subtitle1" component="span">
                            {name}
                        </Typography>
                    }
                    subheader={
                        <Typography variant="h5" component="span">
                            {currentValue}
                        </Typography>
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
                                        onClick={() => {
                                            if (onAddDataHandler) {
                                                onAddDataHandler(template)
                                            }
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
                                    key={index}
                                    index={index}
                                    onRemove={() => {
                                        if (onRemoveDataHandler) {
                                            onRemoveDataHandler(dataHandler.name)
                                        }
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
