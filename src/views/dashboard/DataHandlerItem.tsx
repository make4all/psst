import { useState, useEffect } from 'react'

import { Box, Button, Card, CardContent, CardHeader, Grid, Menu, MenuItem, Typography } from '@mui/material'
import { ArrowDropDown } from '@mui/icons-material'

import { grey } from '@mui/material/colors'
import { DataHandlerWrapper, DataOutputWrapper, JDServiceWrapper } from '../../pages/Dashboard'
import { NoiseSonify } from '../../sonification/output/NoiseSonify'
import { NoteSonify } from '../../sonification/output/NoteSonify'
import { SonifyFixedDuration } from '../../sonification/output/SonifyFixedDuration'
import { Speech } from '../../sonification/output/Speech'
import DataOutputList from './DataOutputList'

import { DataHandler } from '../../sonification/handler/DataHandler'

export interface DataHandlerItemProps {
    name: string
    description: string
    active: boolean
    index: number
    onRemove?: () => void
    onAddToService?: (serviceName: string, valueName: string, dataHandler: DataHandlerWrapper) => void
    handlerObject?: DataHandler
    currentServices?: JDServiceWrapper[]
}

export default function DataHandlerItem(props: React.Attributes & DataHandlerItemProps): JSX.Element {
    const dataOutputList = [
        { name: 'Note', class: NoteSonify },
        { name: 'White Noise', class: NoiseSonify },
        { name: 'Earcon', class: SonifyFixedDuration },
        { name: 'Speech', class: Speech },
    ]

    const [addButtonAnchor, setAddButtonAnchor] = useState<null | HTMLElement>(null)
    const menuOpen = Boolean(addButtonAnchor)

    const handleAddButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAddButtonAnchor(event.currentTarget)
    }
    const handleMenuClose = () => {
        setAddButtonAnchor(null)
    }

    const { active, currentServices, onAddToService } = props

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
                        !active && currentServices ? (
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
                                    {currentServices.map((service) =>
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
                            <DataOutputList dataOutputs={dataOutputList} />
                            {/* <Box sx={{mx: 4}}></Box> */}
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </Grid>
    )
}
