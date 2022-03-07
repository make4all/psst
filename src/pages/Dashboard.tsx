import { OutputEngine } from '../sonification/OutputEngine'

import { Observable, Subject, from, combineLatest } from 'rxjs'

import React, { useState, useEffect } from 'react'

import '../styles/dashboard.css'

import * as d3 from 'd3'

import { bus } from '../bus'

import { JDRegister, JDService, REPORT_UPDATE, throttle } from 'jacdac-ts'
import { JacdacProvider, useServices, useChange, useBus } from 'react-jacdac'

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

import {
    Alert,
    AppBar,
    Box,
    Button,
    Collapse,
    Container,
    Grid,
    IconButton,
    Input,
    InputAdornment,
    Typography,
    Toolbar,
} from '@mui/material'

import { Close } from '@mui/icons-material'

import DataHandlerItem from '../views/dashboard/DataHandlerItem'
import JDServiceItem from '../views/dashboard/JDServiceItem'

import { DataHandler } from '../sonification/handler/DataHandler'
import { DatumOutput } from '../sonification/output/DatumOutput'

import { NoteSonify } from '../sonification/output/NoteSonify'
import { NoiseSonify } from '../sonification/output/NoiseSonify'
import { SonifyFixedDuration } from '../sonification/output/SonifyFixedDuration'
import { Speech } from '../sonification/output/Speech'
import { NoteHandler } from '../sonification/handler/NoteHandler'
import { OutputStateChange } from '../sonification/OutputConstants'
import { Datum } from '../sonification/Datum'

export interface JDServiceWrapper {
    name: string
    serviceObject?: JDService
    values: JDValueWrapper[]
}

export interface JDValueWrapper {
    name: string
    units: string
    index: number
    sinkId: number
    format: (value: number) => string
    register: JDRegister
    dataHandlers: DataHandlerWrapper[]
    unsubscribe?: () => void
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
    unsubscribe?: () => void
}

export interface DataOutputTemplate {
    name: string
    createOutput?: () => DatumOutput
}

export interface DataOutputWrapper {
    name: string
    outputObject?: DatumOutput
}

export enum PlaybackState {
    PlayingLive,
    PlayingBuffer,
    Paused,
    Stopped,
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
    [SRV_ACCELEROMETER]: { values: ['x', 'y', 'z'], units: 'g', format: d3.format('.2f'), domain: [-1, 1] },
    [SRV_BUTTON]: { values: [''], units: '', format: d3.format('.0d'), domain: [0, 1] },
    [SRV_BUZZER]: { values: [''], units: '', format: d3.format('.0d'), domain: [0, 1] },
    [SRV_GYROSCOPE]: { values: ['x', 'y', 'z'], units: '°/s', format: d3.format('.2f'), domain: [0, 360] },
    [SRV_HUMIDITY]: { values: [''], units: '%RH', format: d3.format('.1f'), domain: [0, 1] },
    [SRV_LIGHT_LEVEL]: { values: [''], units: '', format: d3.format('.0%'), domain: [0, 1] },
    [SRV_POTENTIOMETER]: { values: [''], units: '', format: d3.format('.0%'), domain: [0, 1] },
    [SRV_TEMPERATURE]: { values: [''], units: '°C', format: d3.format('.1f'), domain: [-20, 40] },
}

export const AVAILABLE_DATA_HANDLER_TEMPLATES: DataHandlerTemplate[] = [
    { name: 'Note Handler', description: 'Description of note handler', createHandler: () => new NoteHandler() },
    { name: 'Filter Range Handler', description: 'Description of filter range handler' },
    { name: 'Extrema Handler', description: 'Description of extrema handler' },
    { name: 'Outlier Detection Handler', description: 'Description of outlier detection handler' },
    { name: 'Slope Handler', description: 'Description of slope handler' },
    { name: 'Slope Change Handler', description: 'Description of slope change handler' },
]

export const AVAILABLE_DATA_OUTPUT_TEMPLATES: DataOutputTemplate[] = [
    { name: 'Note', createOutput: () => new NoteSonify() },
    { name: 'White Noise', createOutput: () => new NoiseSonify() },
    { name: 'Earcon', createOutput: () => new NoteSonify() },
    { name: 'Speech', createOutput: () => new Speech() },
]

const playbackSubject = new Subject<PlaybackState>()

export function DashboardView() {
    const [services, setServices] = useState<JDServiceWrapper[]>(DEFAULT_SERVICE_LIST)
    const [alertOpen, setAlertOpen] = useState(false)
    const [playback, setPlayback] = useState(PlaybackState.Stopped)

    playbackSubject.next(playback)
    const jdServices = useServices({ sensor: true })
    const bus = useBus()
    const connected = useChange(bus, (_) => _.connected)

    useEffect(() => {
        playbackSubject.next(playback)
    }, [playback])

    useEffect(() => {
        const newServices = jdServices
            .filter((jds) => SRV_INFO_MAP[jds.specification.classIdentifier])
            .map((jds) => {
                const serviceInfo = SRV_INFO_MAP[jds.specification.classIdentifier]
                const serviceWrapper = {
                    name: jds.specification.name,
                    values: serviceInfo.values.map((v, i) => {
                        const sink = OutputEngine.getInstance().addSink(
                            `JacDac Service = ${jds.specification.name}; Index = ${i}`,
                        )
                        const sinkId = sink.id

                        const rawSubject = new Subject<Datum>()

                        OutputEngine.getInstance().setStream(sinkId, rawSubject)

                        const jdUnsubscribe = jds.readingRegister.subscribe(REPORT_UPDATE, () => {
                            rawSubject.next(new Datum(sinkId, jds.readingRegister.unpackedValue[i]))
                        })

                        const unsubscribe = () => {
                            // Is this going to create a memory leak?
                            // .. do I have to remove pointers to the Observables?
                            jdUnsubscribe()
                        }
                        return {
                            name: v,
                            index: i,
                            sinkId: sink.id,
                            units: serviceInfo.units,
                            format: serviceInfo.format,
                            register: jds.readingRegister,
                            dataHandlers: [],
                            unsubscribe,
                        }
                    }),
                }
                return serviceWrapper
            })
        setServices(newServices)
    }, [jdServices.map((jdService) => jdService.id).join(' ')])

    useEffect(() => {
        setAlertOpen(connected)
    }, [connected])

    const handleConnect = async () => {
        if (connected) {
            console.log('disconnect')
            await bus.disconnect()
        } else {
            console.log('connect')
            await bus.connect()
        }
    }

    const handlePlaybackClick = () => {
        switch (playback) {
            case PlaybackState.PlayingLive:
                OutputEngine.getInstance().next(OutputStateChange.Pause)
                setPlayback(PlaybackState.Stopped)
                break
            case PlaybackState.PlayingBuffer:
                break
            case PlaybackState.Paused:
                break
            case PlaybackState.Stopped:
                OutputEngine.getInstance().next(OutputStateChange.Play)
                setPlayback(PlaybackState.PlayingLive)
                break
        }
    }

    const handleRemoveDataHandlerFromService = (serviceName: string, valueName: string, handlerName: string) => {
        const servicesCopy = services.map((service) => {
            if (serviceName === service.name) {
                const values = service.values.map((value) => {
                    if (valueName === value.name) {
                        const indexToRemove = value.dataHandlers.findIndex(
                            (dataHandler) => dataHandler.name == handlerName,
                        )
                        const dataHandlerToRemove = value.dataHandlers[indexToRemove]
                        dataHandlerToRemove.unsubscribe?.()
                        value.dataHandlers.splice(indexToRemove, 1)
                        const sink = OutputEngine.getInstance().getSink(value.sinkId)
                        if (dataHandlerToRemove.handlerObject) {
                            sink.removeDataHandler(dataHandlerToRemove.handlerObject)
                        }
                        return { ...value }
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
                        const handlerObject = template.createHandler?.()
                        // TODO there is a bug where if you add a datahandler while playing, it never gets started

                        if (handlerObject) {
                            OutputEngine.getInstance().getSink(value.sinkId).addDataHandler(handlerObject)

                            value.dataHandlers.push({
                                ...template,
                                dataOutputs: [],
                                handlerObject,
                            })
                        }

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

    const playbackText = playback == PlaybackState.Stopped || playback == PlaybackState.Paused ? 'Play' : 'Stop'

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
                    <Grid container aria-live="polite">
                        <Grid item xs={12} md={9}>
                            <Collapse in={alertOpen}>
                                <Alert
                                    action={
                                        <IconButton
                                            aria-label="close"
                                            color="inherit"
                                            size="small"
                                            onClick={() => {
                                                setAlertOpen(false)
                                            }}
                                        >
                                            <Close fontSize="inherit" />
                                        </IconButton>
                                    }
                                    sx={{ mb: 2 }}
                                >
                                    Your device has been successfully connected. Now you can hear your sensor data!
                                </Alert>
                            </Collapse>
                        </Grid>
                    </Grid>
                </Box>
                <Box>
                    {!connected ? undefined : (
                        <Box>
                            <Box sx={{ mb: 2, mt: 4 }}>
                                <Typography variant="h5" component="h2">
                                    Hear your sensor data
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
                                    <Button
                                        variant="contained"
                                        size="large"
                                        sx={{ mr: 2 }}
                                        onClick={handlePlaybackClick}
                                    >
                                        {playbackText}
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
                </Box>
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
