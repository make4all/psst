import { OutputEngine } from '../sonification/OutputEngine'

import { Subject } from 'rxjs'

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
    SRV_SOUND_LEVEL,
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
    Modal,
    Stack,
    CardHeader,
} from '@mui/material'

import { Close } from '@mui/icons-material'

import DataHandlerItem from '../views/dashboard/DataHandlerItem'
import JDServiceItem from '../views/dashboard/JDServiceItem'

import { DataHandler } from '../sonification/handler/DataHandler'
import { DatumOutput } from '../sonification/output/DatumOutput'

import { NoteSonify } from '../sonification/output/NoteSonify'
import { NoiseSonify } from '../sonification/output/NoiseSonify'
import { Speech } from '../sonification/output/Speech'
import { NoteHandler } from '../sonification/handler/NoteHandler'
import { OutputStateChange } from '../sonification/OutputConstants'
import { Datum } from '../sonification/Datum'
import { FilterRangeHandler } from '../sonification/handler/FilterRangeHandler'
import { RunningExtremaHandler } from '../sonification/handler/RunningExtremaHandler'
import { SlopeParityHandler } from '../sonification/handler/SlopeParityHandler'
import { FileOutput } from '../sonification/output/FileOutput'
import { SimpleDataHandler } from '../sonification/handler/SimpleDataHandler'

export interface JDServiceWrapper {
    name: string
    serviceObject?: JDService
    values: JDValueWrapper[]
}

export interface JDValueWrapper {
    name: string
    index: number
    sinkId: number
    domain: [number, number]
    units: string
    format: (value: number) => string
    register: JDRegister
    dataHandlers: DataHandlerWrapper[]
    unsubscribe?: () => void
}

export interface DataHandlerWrapper {
    name: string
    description: string
    dataOutputs: DataOutputWrapper[]
    handlerObject?: DataHandler
    createHandler: (domain: [number, number]) => DataHandler
    unsubscribe?: () => void
    parameters?: ParameterWrapper[]
}

export interface DataOutputWrapper {
    name: string
    createOutput: () => DatumOutput
    outputObject?: DatumOutput
    parameters?: ParameterWrapper[]
}

export interface ParameterWrapper {
    name: string
    type: string
    default?: number
    values?: { display: string; value: number }[]
    handleUpdate: (value: number, obj?: DataHandler | DatumOutput) => void
}

export enum PlaybackState {
    PlayingLive,
    PlayingBuffer,
    Paused,
    Stopped,
}

const SRV_INFO_MAP = {
    [SRV_ACCELEROMETER]: { values: ['x', 'y', 'z'], units: 'g', format: d3.format('.2f'), domain: [-2, 2] },
    [SRV_BUTTON]: { values: [''], units: '', format: d3.format('.0d'), domain: [0, 1] },
    [SRV_BUZZER]: { values: [''], units: '', format: d3.format('.0d'), domain: [0, 1] },
    [SRV_GYROSCOPE]: { values: ['x', 'y', 'z'], units: '°/s', format: d3.format('.2f'), domain: [-500, 500] },
    [SRV_HUMIDITY]: { values: [''], units: '%RH', format: d3.format('.1f'), domain: [0, 100] },
    [SRV_LIGHT_LEVEL]: { values: [''], units: '', format: d3.format('.0%'), domain: [0, 1] },
    [SRV_SOUND_LEVEL]: { values: [''], units: '', format: d3.format('.0d'), domain: [0, 100] },
    [SRV_POTENTIOMETER]: { values: [''], units: '', format: d3.format('.0%'), domain: [0, 1] },
    [SRV_TEMPERATURE]: { values: [''], units: '°C', format: d3.format('.1f'), domain: [-20, 60] },
}

export const AVAILABLE_DATA_OUTPUT_TEMPLATES = {
    note: {
        name: 'Note',
        createOutput: () => new NoteSonify(),
        parameters: [
            {
                name: 'Stereo Pan',
                type: 'list',
                default: 0,
                values: [
                    { display: 'Both', value: 0 },
                    { display: 'Left', value: -1 },
                    { display: 'Right', value: 1 },
                ],
                handleUpdate: (value: number, obj?: DataHandler | DatumOutput) => {
                    if (obj) {
                        const ns = obj as NoteSonify
                        ns.stereoPannerNode.pan.value = value
                    }
                },
            },
        ],
    },
    noise: { name: 'White Noise', createOutput: () => new NoiseSonify() },
    earcon: { name: 'Earcon', createOutput: () => new FileOutput() },
    speech: { name: 'Speech', createOutput: () => new Speech() },
}

const initializeDataOutput = (output: DataOutputWrapper): DataOutputWrapper => {
    return { ...output, outputObject: output.createOutput() }
}

export const AVAILABLE_DATA_HANDLER_TEMPLATES: DataHandlerWrapper[] = [
    {
        name: 'Note Handler',
        description: 'converts data to an audible note range',
        dataOutputs: [initializeDataOutput(AVAILABLE_DATA_OUTPUT_TEMPLATES.note)],
        createHandler: (domain: [number, number]) => new NoteHandler(domain),
    },
    {
        name: 'Filter Range Handler',
        description: 'filters data in a given range. If data is in a given range, it is sent to the output corresponding to this handeler.',
        dataOutputs: [
            initializeDataOutput(AVAILABLE_DATA_OUTPUT_TEMPLATES.noise),
            AVAILABLE_DATA_OUTPUT_TEMPLATES.earcon,
        ],
        createHandler: (domain: [number, number]) =>
            new FilterRangeHandler([
                (domain[1] - domain[0]) * 0.25 + domain[0],
                (domain[1] - domain[0]) * 0.75 + domain[0],
            ]),
        parameters: [
            {
                name: 'Min',
                type: 'number',
                handleUpdate: (value: number, obj?: DataHandler | DatumOutput) => {
                    if (obj) {
                        const frh = obj as FilterRangeHandler
                        frh.domain = [value, frh.domain[1]]
                    }
                },
            },
            {
                name: 'Max',
                type: 'number',
                handleUpdate: (value: number, obj?: DataHandler | DatumOutput) => {
                    if (obj) {
                        const frh = obj as FilterRangeHandler
                        frh.domain = [frh.domain[0], value]
                    }
                },
            },
        ],
    },
    {
        name: 'Extrema Handler',
        description: 'sends the output corresponding to this handeler when the handeler sees a new extrema in the data stream.',
        dataOutputs: [
            AVAILABLE_DATA_OUTPUT_TEMPLATES.earcon,
            initializeDataOutput(AVAILABLE_DATA_OUTPUT_TEMPLATES.speech),
        ],
        // Has min/max direction
        createHandler: (domain: [number, number]) => new RunningExtremaHandler(),
    },
    // { name: 'Outlier Detection Handler', description: 'Description of outlier detection handler' },
    // { name: 'Slope Handler', description: 'Description of slope handler', createHandler: () => new Slope() },
    {
        name: 'Slope Change Handler',
        description: 'this handeler calls the output corresponding to it when the direction of the slope of data changes. That is, when the data goes from increasing to decreasing, and vise-versa',
        dataOutputs: [
            AVAILABLE_DATA_OUTPUT_TEMPLATES.earcon,
            initializeDataOutput(AVAILABLE_DATA_OUTPUT_TEMPLATES.speech),
        ],
        createHandler: (domain: [number, number]) => new SlopeParityHandler(),
    },

    {
        name: 'simple handeler',
        description: 'this handeler calls the output corresponding to it and streams the data without anyprocessing. That is, when the data goes from increasing to decreasing, and vise-versa',
        dataOutputs: [
            initializeDataOutput(AVAILABLE_DATA_OUTPUT_TEMPLATES.speech),
        ],
        createHandler: (domain: [number, number]) => new SimpleDataHandler(),
    },
]   

export function DashboardView() {
    const [services, setServices] = useState<JDServiceWrapper[]>([])
    const [alertOpen, setAlertOpen] = useState(false)
    const [playback, setPlayback] = useState(PlaybackState.Stopped)

    const jdServices = useServices({ sensor: true })
    const bus = useBus()
    const connected = useChange(bus, (_) => _.connected)

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
                            domain: serviceInfo.domain,
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
                OutputEngine.getInstance().next(OutputStateChange.Stop)
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

    const resendPlaybackForOutputEngine = () => {
        switch (playback) {
            case PlaybackState.PlayingLive:
                OutputEngine.getInstance().next(OutputStateChange.Play)
                break
            case PlaybackState.PlayingBuffer:
                break
            case PlaybackState.Paused:
                break
            case PlaybackState.Stopped:
                OutputEngine.getInstance().next(OutputStateChange.Stop)
                break
        }
    }

    const handleParameterChange = () => {
        resendPlaybackForOutputEngine()
    }

    const handleDataHandlerChange = (
        add: boolean,
        serviceName: string,
        valueName: string,
        template: DataHandlerWrapper,
    ) => {
        const servicesCopy = services.map((service) => {
            if (serviceName === service.name) {
                const values = service.values.map((value) => {
                    if (valueName === value.name) {
                        const sink = OutputEngine.getInstance().getSink(value.sinkId)
                        if (add) {
                            const handlerObject = template.createHandler?.(value.domain)

                            if (handlerObject) {
                                const dataOutputsCopy = template.dataOutputs.map((output) => {
                                    const outputObject = output.outputObject ? output.createOutput() : undefined
                                    if (outputObject) {
                                        handlerObject.addOutput(outputObject)
                                    }
                                    return { ...output, outputObject }
                                })
                                sink.addDataHandler(handlerObject)

                                value.dataHandlers.push({
                                    ...template,
                                    dataOutputs: dataOutputsCopy,
                                    handlerObject,
                                })
                            }
                        } else {
                            const indexToRemove = value.dataHandlers.findIndex(
                                (dataHandler) => dataHandler.name === template.name,
                            )
                            const dataHandlerToRemove = value.dataHandlers[indexToRemove]
                            dataHandlerToRemove.unsubscribe?.()
                            value.dataHandlers.splice(indexToRemove, 1)

                            if (dataHandlerToRemove.handlerObject) {
                                sink.removeDataHandler(dataHandlerToRemove.handlerObject)
                            }
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
        resendPlaybackForOutputEngine()
    }

    const playbackText = playback == PlaybackState.Stopped || playback == PlaybackState.Paused ? 'Play' : 'Stop'

    const style = {
        position: 'absolute' as 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 440,
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
    }

    return (
        <>
            <Modal
                open={alertOpen}
                onClose={() => {
                    setAlertOpen(false)
                }}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <div>
                        <CardHeader
                            title={
                                <Typography id="modal-modal-title" variant="h6" component="h2">
                                    JacDac Connected
                                </Typography>
                            }
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
                        ></CardHeader>
                    </div>

                    <Alert sx={{ mb: 2 }}>
                        Your device has been successfully connected. Now you can hear your sensor data!
                    </Alert>
                </Box>
            </Modal>
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
                                            key={s.name}
                                            values={s.values}
                                            currentHandlerTemplates={AVAILABLE_DATA_HANDLER_TEMPLATES}
                                            onDataHandlerChange={handleDataHandlerChange}
                                            onParameterChange={handleParameterChange}
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
                                    {AVAILABLE_DATA_HANDLER_TEMPLATES.map((template, index) => (
                                        <DataHandlerItem
                                            {...template}
                                            active={false}
                                            key={template.name + index}
                                            index={index}
                                            availableServices={services}
                                            onAddToService={handleDataHandlerChange}
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
