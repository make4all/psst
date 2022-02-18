import { OutputEngine } from '../sonification/OutputEngine'

import React, { ChangeEvent } from 'react'

import '../styles/dashboard.css'

import {
    FormControl,
    InputLabel,
    Grid,
    NativeSelect,
    AppBar,
    Typography,
    Toolbar,
    Box,
    Container,
    Button,
} from '@mui/material'
import DataHandlerItem from '../views/dashboard/DataHandlerItem'
import JDServiceItem from '../views/dashboard/JDServiceItem'

// let demoViewRef: React.RefObject<DemoSimple<DemoProps, DemoState> | DemoHighlightRegion> = React.createRef()
export interface DashboardState {}

// Service
//      Stream Value
//              Active Data Handlers
//                      Data Handler Parameters
//                      Data Outputs

const serviceList = [
    {
        name: 'Accelerometer',
        values: [
            { name: 'x', units: 'g', dataHandlers: [] },
            { name: 'y', units: 'g', dataHandlers: [] },
            { name: 'z', units: 'g', dataHandlers: [] },
        ],
    },
    {
        name: 'Gyroscope',
        values: [
            { name: 'x', units: 'm/s', dataHandlers: [] },
            { name: 'y', units: 'm/s', dataHandlers: [] },
            { name: 'z', units: 'm/s', dataHandlers: [] },
        ],
    },
    {
        name: 'Button',
        values: [{ name: 'value', units: '', dataHandlers: [] }],
    },
    {
        name: 'Light Level',
        values: [{ name: 'value', units: '', dataHandlers: [] }],
    },
    {
        name: 'Temperature',
        values: [{ name: 'value', units: 'C', dataHandlers: [] }],
    },
    {
        name: 'Humidity',
        values: [{ name: 'value', units: 'mH', dataHandlers: [] }],
    },
]

const dataHandlerList = [
    { name: 'Note Handler', description: 'Description of note handler' },
    { name: 'Filter Range Handler', description: 'Description of filter range handler' },
    { name: 'Extrema Handler', description: 'Description of extrema handler' },
    { name: 'Outlier Detection Handler', description: 'Description of outlier detection handler' },
    { name: 'Slope Handler', description: 'Description of slope handler' },
    { name: 'Slope Change Handler', description: 'Description of slope change handler' },
]

export interface DemoProps {}

export class Dashboard extends React.Component<DemoProps, DashboardState> {
    constructor(props: DemoProps) {
        super(props)
        this.state = {}
    }

    public render() {
        // const { demoViewValue, dataSummary, playbackLabel, columnSelected, columnList } = this.state

        return (
            <>
                <Box sx={{ flexGrow: 1 }}>
                    <AppBar position="static">
                        <Toolbar>
                            <Typography variant="h5" color="inherit" component="h1">
                                PSST
                            </Typography>
                        </Toolbar>
                    </AppBar>
                </Box>
                <Container>
                    <Box sx={{ my: 2 }}>
                        <Typography variant="subtitle1" component="h2">
                            Connect your device
                        </Typography>
                        <Box sx={{ my: 2 }}>
                            <Button variant="contained">Connect</Button>
                        </Box>
                    </Box>
                    <Box sx={{ mb: 2, mt: 4 }}>
                        <Typography variant="subtitle1" component="h2">
                            Sonify your sensor data
                        </Typography>
                        <Grid container spacing={2} sx={{ my: 1 }}>
                            {serviceList.map((s) => (
                                <JDServiceItem name={s.name} values={s.values} />
                            ))}
                        </Grid>
                    </Box>
                    <Box sx={{ mb: 2, mt: 4 }}>
                        <Typography variant="subtitle1" component="h2">
                            Configure and add sonifiers
                        </Typography>
                        <Grid container spacing={2} sx={{ my: 1 }}>
                            {dataHandlerList.map((dh) => (
                                <DataHandlerItem name={dh.name} description={dh.description} />
                            ))}
                        </Grid>
                    </Box>
                </Container>
            </>
        )
    }
}
