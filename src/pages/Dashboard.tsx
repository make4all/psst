import { OutputEngine } from '../sonification/OutputEngine'

import { Subject } from 'rxjs'

import { useState, useEffect, useMemo } from 'react'

import '../styles/dashboard.css'

import * as d3 from 'd3'

import { bus } from '../bus'

import { JDRegister, JDService, REPORT_UPDATE, SoundLevelReg, TraceRecorder } from 'jacdac-ts'
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
    Container,
    Grid,
    IconButton,
    Typography,
    Toolbar,
    Modal,
    CardHeader,
    Link,
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
    id: string
    serviceObject?: JDService
    values: JDValueWrapper[]
}

export interface JDValueWrapper {
    name: string
    id: string
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
    id: string
    description: string
    dataOutputs: DataOutputWrapper[]
    handlerObject?: DataHandler
    createHandler: (domain: [number, number]) => DataHandler
    unsubscribe?: () => void
    parameters?: ParameterWrapper[]
}

export interface DataOutputWrapper {
    name: string
    id: string
    createOutput: () => DatumOutput
    outputObject?: DatumOutput
    parameters?: ParameterWrapper[]
}

export interface ParameterWrapper {
    name: string
    type: string
    default?: (obj?: DataHandler | DatumOutput) => number
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
    [SRV_SOUND_LEVEL]: { values: [''], units: '', format: d3.format('.2f'), domain: [0, 1] },
    [SRV_POTENTIOMETER]: { values: [''], units: '', format: d3.format('.0%'), domain: [0, 1] },
    [SRV_TEMPERATURE]: { values: [''], units: '°C', format: d3.format('.1f'), domain: [-20, 60] },
}

export const AVAILABLE_DATA_OUTPUT_TEMPLATES = {
    note: {
        name: 'Note',
        id: `Note-${Math.floor(Math.random() * Date.now())}`,
        createOutput: () => new NoteSonify(),
        parameters: [
            {
                name: 'Stereo Pan',
                type: 'list',
                default: (obj?: DataHandler | DatumOutput) => 0,
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
    noise: {
        name: 'White Noise',
        id: `White Noise-${Math.floor(Math.random() * Date.now())}`,
        createOutput: () => new NoiseSonify(),
    },
    earcon: {
        name: 'Earcon',
        id: `Earcon-${Math.floor(Math.random() * Date.now())}`,
        createOutput: () => {
            const fo = new FileOutput()
            // Use long beep as the default
            fetch(`./assets/shortbeep.wav`)
                .then((res) => res.arrayBuffer())
                .then((buffer: ArrayBuffer) => {
                    fo.buffer = buffer
                })
            return fo
        },
        parameters: [
            {
                name: 'Earcon to Play',
                type: 'list',
                default: (obj?: DataHandler | DatumOutput) => 0,
                values: [
                    { display: 'Short Beep', value: 0 },
                    { display: 'Long Beep', value: 1 },
                    { display: 'Bell', value: 2 },
                    { display: 'Whistle Up', value: 3 },
                    { display: 'Whistle Down', value: 4 },
                ],
                handleUpdate: (value: number, obj?: DataHandler | DatumOutput) => {
                    if (obj) {
                        const file_list = [
                            'shortbeep.wav',
                            'beep.wav',
                            'bell.mp3',
                            'whistle%20up.wav',
                            'whistle%20down.wav',
                        ]
                        const fo = obj as FileOutput
                        fetch(`./assets/${file_list[value]}`)
                            .then((res) => res.arrayBuffer())
                            .then((buffer: ArrayBuffer) => {
                                fo.buffer = buffer
                            })
                    }
                },
            },
        ],
    },
    speech: {
        name: 'Speech',
        id: `Speech-${Math.floor(Math.random() * Date.now())}`,
        createOutput: () => new Speech(),
        parameters: [
            {
                name: 'Interrupt when new point arrives?',
                type: 'list',
                default: (obj?: DataHandler | DatumOutput) => 0,
                values: [
                    { display: 'Yes', value: 0 },
                    { display: 'No', value: 1 },
                ],
                handleUpdate: (value: number, obj?: DataHandler | DatumOutput) => {
                    if (obj) {
                        const sp = obj as Speech
                        sp.polite = value == 1 ? true : false
                    }
                },
            }
        ]
    },
}

const initializeDataOutput = (output: DataOutputWrapper): DataOutputWrapper => {
    return { ...output, outputObject: output.createOutput() }
}

export const AVAILABLE_DATA_HANDLER_TEMPLATES: DataHandlerWrapper[] = [
    {
        name: 'Note Handler',
        id: `Note Handler-${Math.floor(Math.random() * Date.now())}`,
        description: 'Converts data to an audible note range.',
        dataOutputs: [initializeDataOutput(AVAILABLE_DATA_OUTPUT_TEMPLATES.note)],
        createHandler: (domain: [number, number]) => new NoteHandler(domain),
    },
    {
        name: 'Filter Range Handler',
        id: `Filter Range Handler-${Math.floor(Math.random() * Date.now())}`,
        description: "Filters data within the provided range. If within range, sent to this handler's outputs.",
        dataOutputs: [
            initializeDataOutput(AVAILABLE_DATA_OUTPUT_TEMPLATES.noise),
            AVAILABLE_DATA_OUTPUT_TEMPLATES.earcon,
        ],
        createHandler: (domain: [number, number]) =>
            new FilterRangeHandler([
                (domain[1] - domain[0]) * 0.4 + domain[0],
                (domain[1] - domain[0]) * 0.6 + domain[0],
            ]),
        parameters: [
            {
                name: 'Min',
                type: 'number',
                default: (obj?: DataHandler | DatumOutput) => {
                    if (obj) {
                        const frh = obj as FilterRangeHandler
                        return frh.domain[0]
                    } else {
                        return 0.4
                    }
                },
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
                default: (obj?: DataHandler | DatumOutput) => {
                    if (obj) {
                        const frh = obj as FilterRangeHandler
                        return frh.domain[1]
                    } else {
                        return 0.6
                    }
                },
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
        id: `Extrema Handler-${Math.floor(Math.random() * Date.now())}`,
        description: 'Finds the new extrema value (maximum and/or minimum) in the data stream.',
        dataOutputs: [
            AVAILABLE_DATA_OUTPUT_TEMPLATES.earcon,
            initializeDataOutput(AVAILABLE_DATA_OUTPUT_TEMPLATES.speech),
        ],
        createHandler: (domain: [number, number]) => new RunningExtremaHandler(),
        parameters: [
            {
                name: 'Extrema to Find',
                type: 'list',
                default: (obj?: DataHandler | DatumOutput) => 0,
                values: [
                    { display: 'Maximum and Minimum', value: 0 },
                    { display: 'Maximum Only', value: 1 },
                    { display: 'Minimum Only', value: -1 },
                ],
                handleUpdate: (value: number, obj?: DataHandler | DatumOutput) => {
                    if (obj) {
                        const reh = obj as RunningExtremaHandler
                        reh.direction = value
                    }
                },
            },
        ],
    },
    // { name: 'Outlier Detection Handler', description: 'Description of outlier detection handler' },
    // { name: 'Slope Handler', description: 'Description of slope handler', createHandler: () => new Slope() },
    {
        name: 'Slope Change Handler',
        id: `Slope Change Handler-${Math.floor(Math.random() * Date.now())}`,
        description:
            'Finds direction of slope changes in the data stream. When the data goes from increasing to decreasing, and vise-versa.',
        dataOutputs: [
            AVAILABLE_DATA_OUTPUT_TEMPLATES.earcon,
            initializeDataOutput(AVAILABLE_DATA_OUTPUT_TEMPLATES.speech),
        ],
        createHandler: (domain: [number, number]) => new SlopeParityHandler(),
        parameters: [
            {
                name: 'Direction to Find',
                type: 'list',
                default: (obj?: DataHandler | DatumOutput) => 0,
                values: [
                    { display: 'Postive and Negative', value: 0 },
                    { display: 'Positive Only', value: 1 },
                    { display: 'Negative Only', value: -1 },
                ],
                handleUpdate: (value: number, obj?: DataHandler | DatumOutput) => {
                    if (obj) {
                        const sph = obj as SlopeParityHandler
                        sph.direction = value
                    }
                },
            },
        ],
    },

    {
        name: 'Simple Handler',
        id: `Simple Handler-${Math.floor(Math.random() * Date.now())}`,
        description: 'Outputs the raw data stream without processing.',
        dataOutputs: [initializeDataOutput(AVAILABLE_DATA_OUTPUT_TEMPLATES.speech)],
        createHandler: (domain: [number, number]) => new SimpleDataHandler(),
    },
]

function saveText(name: string, data: string, mimeType?: string) {
    if (!mimeType) {
        if (/\.(csv|txt)/i.test(name)) mimeType = 'text/plain'
        else if (/\.json/i.test(name)) mimeType = 'application/json'
    }
    const url = `data:${mimeType || 'text/plain'};charset=utf-8,${encodeURIComponent(data)}`
    downloadUrl(name, url)

    function downloadUrl(name: string, url: string) {
        const a = document.createElement('a') as HTMLAnchorElement
        document.body.appendChild(a)
        a.style.display = 'none'
        a.href = url
        a.download = name
        a.click()
    }
}

function SaveTraceButton() {
    const bus = useBus()
    const recorder = useMemo(() => new TraceRecorder(bus), [])
    useEffect(() => {
        recorder.start()
        return () => {
            recorder.stop()
        }
    }, [recorder])
    const onClick = () => {
        const busText = bus.describe()
        const traceText = recorder.trace.serializeToText()
        const text = `# Jacdac Trace 
        
To import, go to https://aka.ms/jacdac, open device tree and click import icon.

## bus

\`\`\`yaml
${busText}
\`\`\`

## packets

\`\`\`
${traceText}
\`\`\`

## environment

\`\`\`yaml
user-agent: ${typeof window !== undefined && window.navigator.userAgent}
\`\`\`

`
        saveText('trace.jd.txt', text)
    }

    return (
        <Link
            title="save trace and environment information in a file"
            component="button"
            onClick={onClick}
            underline="hover"
        >
            save trace
        </Link>
    )
}

const dbg = typeof window !== 'undefined' && /dbg=1/i.test(window.location.search)
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
                const serviceId = jds.id
                if (jds.specification.classIdentifier === SRV_SOUND_LEVEL) {
                    // If sound level service, turn on sound level
                    const enabledRegister = jds.register(SoundLevelReg.Enabled)
                    enabledRegister.sendSetBoolAsync(true, true)
                }
                const serviceWrapper = {
                    name: `${jds.specification.name} ${jds.device.name}`,
                    id: serviceId,
                    values: serviceInfo.values.map((v, i) => {
                        const sink = OutputEngine.getInstance().addSink(
                            `JacDac Service = ${jds.specification.name}; Index = ${i}`,
                        )
                        const sinkId = sink.id

                        const rawSubject = new Subject<Datum>()

                        OutputEngine.getInstance().setStream(sinkId, rawSubject)

                        const jdUnsubscribe = jds.readingRegister.subscribe(REPORT_UPDATE, () => {
                            // console.log(jds.specification.name, v, jds.readingRegister.unpackedValue[i])
                            rawSubject.next(new Datum(sinkId, jds.readingRegister.unpackedValue[i]))
                        })

                        const unsubscribe = () => {
                            // Is this going to create a memory leak?
                            // .. do I have to remove pointers to the Observables?
                            jdUnsubscribe()
                        }
                        return {
                            name: v,
                            id: `${serviceId}:${i}`,
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
                console.log(serviceWrapper)
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
        serviceId: string,
        valueId: string,
        template: DataHandlerWrapper,
    ) => {
        console.log(add, serviceId, valueId, template)
        const servicesCopy = services.map((service) => {
            if (serviceId === service.id) {
                const values = service.values.map((value) => {
                    if (valueId === value.id) {
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
                                    id: `${template.name}-${Math.floor(Math.random() * Date.now())}`,
                                    dataOutputs: dataOutputsCopy,
                                    handlerObject,
                                })
                            }
                        } else {
                            const indexToRemove = value.dataHandlers.findIndex(
                                (dataHandler) => dataHandler.id === template.id,
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
        console.log(servicesCopy)
        setServices(servicesCopy)
        resendPlaybackForOutputEngine()
    }

    const playbackText = playback == PlaybackState.Stopped || playback == PlaybackState.Paused ? 'Play' : 'Stop'

    const modalContentStyle = {
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
                <Box sx={modalContentStyle}>
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
                <Box role="region" aria-labelledby="header-connect-device" sx={{ my: 2 }}>
                    <Typography id="header-connect-device" variant="h5" component="h2">
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
                            <Box role="region" aria-labelledby="header-hear-data" sx={{ mb: 2, mt: 4 }}>
                                <Typography id="header-hear-data" variant="h5" component="h2">
                                    Hear your sensor data
                                </Typography>
                                <div
                                    style={{ width: '1px', height: '1px', position: 'absolute', left: '-200px' }}
                                    aria-live="polite"
                                    aria-atomic="true"
                                    aria-relevant="additions removals"
                                >
                                    <Typography variant="h6" component="h3">
                                        List of {services.length} sensor services connected:
                                    </Typography>
                                    <ul>
                                        {services.map((s) => (
                                            <li key={s.id}>{s.name}</li>
                                        ))}
                                    </ul>
                                </div>
                                <Grid container spacing={2} sx={{ my: 1 }}>
                                    {services.map((service) => (
                                        <JDServiceItem
                                            {...service}
                                            id={service.id}
                                            key={service.id}
                                            currentHandlerTemplates={AVAILABLE_DATA_HANDLER_TEMPLATES}
                                            onDataHandlerChange={handleDataHandlerChange}
                                            onParameterChange={handleParameterChange}
                                        />
                                    ))}
                                </Grid>
                            </Box>
                            <Box role="region" aria-labelledby="header-play-data" sx={{ mb: 2, mt: 4 }}>
                                <Typography id="header-play-data" variant="h5" component="h3">
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
                                    {/* <Button variant="contained" size="large" sx={{ mx: 2 }}>

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
                                    /> */}

                                </Box>
                            </Box>
                            <Box role="region" aria-labelledby="header-configure-add" sx={{ mb: 2, mt: 4 }}>
                                <Typography id="header-configure-add" variant="h5" component="h3">
                                    Configure and add sonifiers
                                </Typography>
                                <Grid container spacing={2} sx={{ my: 1 }}>
                                    {AVAILABLE_DATA_HANDLER_TEMPLATES.map((template, index) => (
                                        <DataHandlerItem
                                            {...template}
                                            active={false}
                                            key={template.id}
                                            availableServices={services}
                                            onAddToService={handleDataHandlerChange}
                                        />
                                    ))}
                                </Grid>
                            </Box>
                        </Box>
                    )}
                </Box>
                <footer>{dbg && <SaveTraceButton />}</footer>
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
