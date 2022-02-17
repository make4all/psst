import { OutputEngine } from '../sonification/OutputEngine'

import React, { ChangeEvent } from 'react'

import '../styles/dashboard.css';

import { FormControl, InputLabel, Grid, NativeSelect, AppBar, Typography, Toolbar, Box, Container, Button } from '@mui/material'
import DataHandlerItem from '../views/dashboard/DataHandlerItem';


// let demoViewRef: React.RefObject<DemoSimple<DemoProps, DemoState> | DemoHighlightRegion> = React.createRef()
export interface DashboardState {
    dataSummary: any
    columnList: string[]
    columnSelected: string
    demoViewValue: string
    playbackLabel: string
}

export interface DemoProps {}

export class Dashboard extends React.Component<DemoProps, DashboardState> {
    constructor(props: DemoProps) {
        super(props)
        this.state = {
            dataSummary: { min: 300, max: 500, median: 400, mean: 400, count: 200 },
            demoViewValue: 'simple',
            playbackLabel: 'play',
            columnSelected: 'Value',
            columnList: ['Value'],
        }
    }

    public render() {
        // const { demoViewValue, dataSummary, playbackLabel, columnSelected, columnList } = this.state

        return (
            <>
                <Box sx={{ flexGrow: 1 }}>
                    <AppBar position="static">
                        <Toolbar>
                            <Typography variant="h5" color="inherit" component="h1">PSST</Typography>
                        </Toolbar>
                    </AppBar>
                </Box>
                <Container>
                    <Box sx={{ my: 2 }}>
                        <Typography variant="subtitle1" component="h2">Connect your device</Typography>
                        <Box sx={{ my: 2 }}>
                            <Button variant="contained">Connect</Button>
                        </Box>
                    </Box>
                    <Box sx={{ mb: 2, mt: 4 }}>
                        <Typography variant="subtitle1" component="h2">Sonify your sensor data</Typography>
                        <Grid container spacing={2} sx={{my: 1}}>
                            <DataHandlerItem name="Note Handler" description="Description of the Note Handler"/>
                            <DataHandlerItem name="Filter Range Handler" description="Description of the Filter Range Handler"/>
                            <DataHandlerItem name="Extreme Handler" description="Description of the Extreme Handler"/>
                        </Grid>
                    </Box>
                </Container>
            </>
        )
    }
}
