import { OutputEngine } from '../sonification/OutputEngine'

import React, { useState, useEffect } from 'react'

import '../styles/dashboard.css'

import * as d3 from 'd3'

import { JDRegister } from 'jacdac-ts'
import { useServices, useChange, useBus } from 'react-jacdac'
import { bus } from '../bus'
import { JacdacProvider } from 'react-jacdac'

import { Grid, AppBar, Typography, Toolbar, Box, Container, Button, Input, InputAdornment } from '@mui/material'
import DataHandlerItem from '../views/dashboard/DataHandlerItem'
import JDServiceItem from '../views/dashboard/JDServiceItem'
import { JDService } from 'jacdac-ts'
import { DataHandler } from '../sonification/handler/DataHandler'
import { DatumOutput } from '../sonification/output/DatumOutput'

import {
    SRV_ACCELEROMETER,
    SRV_BUTTON,
    SRV_BUZZER,
    SRV_GYROSCOPE,
    SRV_HUMIDITY,
    SRV_LIGHT_LEVEL,
    SRV_POTENTIOMETER,
    SRV_TEMPERATURE,
} from 'jacdac-ts'
import { NoteSonify } from '../sonification/output/NoteSonify'
import { NoiseSonify } from '../sonification/output/NoiseSonify'
import { SonifyFixedDuration } from '../sonification/output/SonifyFixedDuration'
import { Speech } from '../sonification/output/Speech'

export interface JDServiceWrapper {
    name: string
    serviceObject?: JDService
    values: JDValueWrapper[]
}

export interface JDValueWrapper {
    name: string
    units: string
    index: number
    format: (value: number) => string
    register: JDRegister
    dataHandlers: DataHandlerWrapper[]
}

export interface DataHandlerTemplate {
    name: string
    description: string
    createHandler?: () => DataHandler
}

export interface DataHandlerWrapper {
    name: string
    description: string
    handlerObject?: DataHandler
    dataOutputs: DataOutputWrapper[]
}

export interface DataOutputTemplate {
    name: string
    createOutput?: () => DatumOutput
}

export interface DataOutputWrapper {
    name: string
    outputObject?: DatumOutput
}

const formatMap = {
    accelerometer: (v: number) => v.toFixed(2),
}

const unitMap = {
    accelerometer: 'g',
}

const DEFAULT_SERVICE_LIST: JDServiceWrapper[] = [
    // {
    //     name: 'Accelerometer',
    //     values: [
    //         { name: 'x', unit: unitMap.accelerometer, format: formatMap.accelerometer, dataHandlers: [] },
    //         { name: 'y', unit: unitMap.accelerometer, format: formatMap.accelerometer, dataHandlers: [] },
    //         { name: 'z', unit: unitMap.accelerometer, format: formatMap.accelerometer, dataHandlers: [] },
    //     ],
    // },
    // {
    //     name: 'Button',
    //     values: [{ name: '', unit: '', format: formatMap.accelerometer, dataHandlers: [] }],
    // },
]

const SRV_INFO_MAP = {
    [SRV_ACCELEROMETER]: { values: ['x', 'y', 'z'], units: 'g', format: d3.format('.2f') },
    [SRV_BUTTON]: { values: [''], units: '', format: d3.format('.0d') },
    [SRV_BUZZER]: { values: [''], units: '', format: d3.format('.0d') },
    [SRV_GYROSCOPE]: { values: ['x', 'y', 'z'], units: '°/s', format: d3.format('.2f') },
    [SRV_HUMIDITY]: { values: [''], units: '%RH', format: d3.format('.1f') },
    [SRV_LIGHT_LEVEL]: { values: [''], units: '', format: d3.format('.0%') },
    [SRV_POTENTIOMETER]: { values: [''], units: '', format: d3.format('.0%') },
    [SRV_TEMPERATURE]: { values: [''], units: '°C', format: d3.format('.1f') },
}

const AVAILABLE_DATA_HANDLER_TEMPLATES: DataHandlerTemplate[] = [
    { name: 'Note Handler', description: 'Description of note handler' },
    { name: 'Filter Range Handler', description: 'Description of filter range handler' },
    { name: 'Extrema Handler', description: 'Description of extrema handler' },
    { name: 'Outlier Detection Handler', description: 'Description of outlier detection handler' },
    { name: 'Slope Handler', description: 'Description of slope handler' },
    { name: 'Slope Change Handler', description: 'Description of slope change handler' },
]

const AVAILABLE_DATA_OUTPUT_TEMPLATES: DataOutputTemplate[] = [
    { name: 'Note', createOutput: () => new NoteSonify() },
    { name: 'White Noise', createOutput: () => new NoiseSonify() },
    { name: 'Earcon', createOutput: () => new NoteSonify() },
    { name: 'Speech', createOutput: () => new Speech() },
]

export function DashboardView() {
    const [services, setServices] = useState<JDServiceWrapper[]>(DEFAULT_SERVICE_LIST)
    const jdServices = useServices({ sensor: true })
    console.log(jdServices)
    const bus = useBus()
    const connected = useChange(bus, (_) => _.connected)

    useEffect(() => {
        const newServices = jdServices.map((jds) => {
            const serviceInfo = SRV_INFO_MAP[jds.specification.classIdentifier]
            const serviceWrapper = {
                name: jds.specification.name,
                values: serviceInfo.values.map((v, i) => ({
                    name: v,
                    index: i,
                    units: serviceInfo.units,
                    format: serviceInfo.format,
                    register: jds.readingRegister,
                    dataHandlers: [],
                })),
            }
            return serviceWrapper
        })
        setServices(newServices)
    }, [jdServices.map((jdService) => jdService.id).join(' ')])

    const handleConnect = async () => {
        if (connected) {
            console.log('disconnect')
            await bus.disconnect()
        } else {
            console.log('connect')
            await bus.connect()
        }
    }

    const handleRemoveDataHandlerFromService = (serviceName: string, valueName: string, handlerName: string) => {
        console.log(handlerName)
        const servicesCopy = services.map((service) => {
            if (serviceName === service.name) {
                const values = service.values.map((value) => {
                    if (valueName === value.name) {
                        const dataHandlers = value.dataHandlers.filter((dataHandler) => dataHandler.name != handlerName)
                        console.log(dataHandlers)
                        return { ...value, dataHandlers }
                    }
                    return value
                })
                return { ...service, values }
            }
            return service
        })
        setServices(servicesCopy)
    }

    const handleAddDataHandlerToService = (serviceName: string, valueName: string, template: DataHandlerTemplate) => {
        console.log(template)
        const servicesCopy = services.map((service) => {
            if (serviceName === service.name) {
                service.values.map((value) => {
                    if (valueName === value.name) {
                        value.dataHandlers.push({ ...template, dataOutputs: [] })
                        return { ...value }
                    }
                    return value
                })
                return { ...service }
            }
            return service
        })
        setServices(servicesCopy)
    }

    return (
        <>
            <Box sx={{ flexGrow: 1 }}>
                <AppBar position="static">
                    <Toolbar>
                        <Typography variant="h4" color="inherit" component="h1">
                            PSST
                        </Typography>
                    </Toolbar>
                </AppBar>
            </Box>
            <Container>
                <Box sx={{ my: 2 }}>
                    <Typography variant="h5" component="h2">
                        Connect your device
                    </Typography>
                    <Box sx={{ my: 2 }}>
                        <Button variant="contained" onClick={handleConnect}>
                            {connected ? 'Disconnect' : 'Connect'}
                        </Button>
                    </Box>
                </Box>
                {services.length === 0 ? undefined : (
                    <Box>
                        <Box sx={{ mb: 2, mt: 4 }}>
                            <Typography variant="h5" component="h2">
                                Sonify your sensor data
                            </Typography>
                            <Grid container spacing={2} sx={{ my: 1 }}>
                                {services.map((s, i) => (
                                    <JDServiceItem
                                        name={s.name}
                                        key={i}
                                        values={s.values}
                                        currentHandlerTemplates={AVAILABLE_DATA_HANDLER_TEMPLATES}
                                        onAddDataHandler={handleAddDataHandlerToService}
                                        onRemoveDataHandler={handleRemoveDataHandlerFromService}
                                    />
                                ))}
                            </Grid>
                        </Box>
                        <Box sx={{ mb: 2, mt: 4 }}>
                            <Typography variant="h5" component="h2">
                                Play your data sonification
                            </Typography>
                            <Box sx={{ my: 2 }}>
                                <Button variant="contained" size="large" sx={{ mr: 2 }}>
                                    Play
                                </Button>
                                <Button variant="contained" size="large" sx={{ mx: 2 }}>
                                    Go Back
                                </Button>
                                <Input
                                    id="input-number-go-back-time"
                                    sx={{ width: '15ch' }}
                                    defaultValue={5}
                                    endAdornment={<InputAdornment position="end">seconds</InputAdornment>}
                                    inputProps={{
                                        'aria-label': 'go back time',
                                        type: 'number',
                                    }}
                                />
                            </Box>
                        </Box>
                        <Box sx={{ mb: 2, mt: 4 }}>
                            <Typography variant="h5" component="h2">
                                Configure and add sonifiers
                            </Typography>
                            <Grid container spacing={2} sx={{ my: 1 }}>
                                {AVAILABLE_DATA_HANDLER_TEMPLATES.map((dataHandler, index) => (
                                    <DataHandlerItem
                                        {...dataHandler}
                                        active={false}
                                        key={index}
                                        index={index}
                                        availableServices={services}
                                        availableDataOutputs={AVAILABLE_DATA_OUTPUT_TEMPLATES}
                                        onAddToService={handleAddDataHandlerToService}
                                    />
                                ))}
                            </Grid>
                        </Box>
                    </Box>
                )}
            </Container>
        </>
    )
}

export default function Page() {
    return (
        <JacdacProvider initialBus={bus}>
            <DashboardView />
        </JacdacProvider>
    )
}
