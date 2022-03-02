import React, { FC, useState, useEffect } from 'react'
// import ConnectButton from "../../jacdac-docs/src/components/buttons/ConnectButton"

// import { JDBus } from "jacdac-ts/src/jdom/bus"

import {
    SRV_ACCELEROMETER,
    REPORT_UPDATE,
    throttle,
    startDevTools,
    inIFrame,
    SRV_BUTTON,
    EVENT,
    ButtonEvent,
    JDService,
} from 'jacdac-ts'
import { useServices, useChange, useBus, useEvent } from 'react-jacdac'
import { Button } from '@mui/material'
import { OutputEngine } from '../sonification/OutputEngine'
import { JacdacProvider } from 'react-jacdac'
import { bus } from '../bus'
import { DataSink } from '../sonification/DataSink'
import { NoteHandler } from '../sonification/handler/NoteHandler'
import { OutputStateChange } from '../sonification/OutputConstants'
import { filter, Observable, OperatorFunction, pipe, Subject, UnaryFunction } from 'rxjs'
import { Datum } from '../sonification/Datum'
import { RunningExtremaHandler } from '../sonification/handler/RunningExtremaHandler'
import { SlopeParityHandler } from '../sonification/handler/SlopeParityHandler'
import { Speech } from '../sonification/output/Speech'
import { SettingsInputAntennaTwoTone } from '@mui/icons-material'

const TONE_THROTTLE = 100

/**
 * helper function to filter out null values from subjects, and create an observable<Datum> for the sink to subscribe.
 * Source: https://stackoverflow.com/questions/57999777/filter-undefined-from-rxjs-observable
 * @returns observable <datum>
 */

function filterNullish<T>(): UnaryFunction<Observable<T | null | undefined>, Observable<T>> {
    return pipe(filter((x) => x != null) as OperatorFunction<T | null | undefined, T>)
}

function MicroBitButton(props: {outputEngine: OutputEngine, service: JDService}) {
    const { service, outputEngine } = props
    const downEvent = useEvent(service, ButtonEvent.Down)
    const upEvent = useEvent(service, ButtonEvent.Up)

    const [instanceName, setInstanceName] = useState('')
    const [state, setState] = useState('up')

    // id corresponds to button functionality
    const handleButton = (id: string, down: boolean) => {
        // only act on an up event

        if (down)
            setState("down")
        else
            setState("up")

        if (down) return

        if (id === "A+B") {
            if (outputEngine.value === OutputStateChange.Play)
                outputEngine.next(OutputStateChange.Stop)
            else
                outputEngine.next(OutputStateChange.Play)
        }
    }
    useEffect(() => {
        if (instanceName === "") return
        downEvent.subscribe(EVENT, () => handleButton(instanceName, true))
    }, [downEvent, instanceName])
    useEffect(() =>{
        if (instanceName === "") return
        upEvent.subscribe(EVENT, () => handleButton(instanceName, false))
    }, [upEvent, instanceName])

    useEffect(() => {
        const resolveIName = async () => setInstanceName(await service.resolveInstanceName())
        resolveIName()
    }, [])
    return (<div key={service.friendlyName}><br/><>{instanceName} {state}</></div>)
}

function ConnectButton() {
    const bus = useBus()
    const connected = useChange(bus, (_) => _.connected)
    const services = useServices({ serviceClass: SRV_ACCELEROMETER })
    const buttons = useServices({ serviceClass: SRV_BUTTON })
    const [streaming, setStreaming] = useState(false)
    const [xSink, setXSink] = useState<DataSink>()
    const [ySink, setYSink] = useState<DataSink>()
    const [zSink, setZSink] = useState<DataSink>()
    const [xAxisStream, setXAxisStream] = useState<Subject<Datum>>()
    const [yAxisStream, setYAxisStream] = useState<Subject<Datum>>()
    const [zAxisStream, setZAxisStream] = useState<Subject<Datum>>()

    useEffect(() => {
        if (!inIFrame() && window.location.hash === '#dbg') startDevTools()
    }, [])

    // register for accelerometer data events
    useEffect(() => {
        if (!services || services.length === 0) return
        const accelService = services[0]
        const unsubs = accelService.readingRegister.subscribe(
            REPORT_UPDATE,
            // don't trigger more than every 100ms
            throttle(async () => {
                if (!streaming || !xSink || !ySink || !zSink) return
                const [x, y, z] = accelService.readingRegister.unpackedValue
                console.log('vpotluri: calling PushPoint.')
                if (xSink && xAxisStream) xAxisStream.next(new Datum(xSink.id, x))
                // if(ySink && yAxisStream) yAxisStream.next(new Datum(ySink.id,y))
                // if(zSink && zAxisStream) zAxisStream.next(new Datum(zSink.id,z))
                // OutputEngine.getInstance().pushPoint(x, sink.id)
            }, TONE_THROTTLE),
        )

        // cleanup callback
        return () => unsubs?.()
    }, [services])

    useEffect(()=>{
        OutputEngine.getInstance().subscribe((e: OutputStateChange)=>{
            console.log("Chaning streaming state ", e)
            if (e === OutputStateChange.Play) 
                setStreaming(true);
            else 
                setStreaming(false);
        })
        return () => OutputEngine.getInstance().unsubscribe()
    }, [])

    const handleConnect = async () => {
        if (connected) {
            console.log('DISCONNECT')
            await bus.disconnect()
        } else {
            console.log('connect')
            await bus.connect()
        }
    }

    const handleStartStreaming = () => {
        console.log('entering handel stream')
        let xSinkID: number = 0
        let ySinkID: number = 1
        let zSinkID: number = 2
        let srcX = xSink
        let srcY = ySink
        let srcZ = zSink
        if (OutputEngine.getInstance().value !== OutputStateChange.Play) {
            console.log('streaming was false')
            /**
             * check if a sink exists to stream X axis data to. else create one.
             */
            if (!srcX) {
                srcX = OutputEngine.getInstance().addSink('jacdac accelerometer X axis')
                console.log(`added sink to stream x axis data ${xSink}`)
                srcX.addDataHandler(new NoteHandler([-1, 1], -1))
                // src.addDataHandler(new FilterRangeHandler(new NoiseSonify(), [-1, 0]))
                // dummy stats. Do we know the min and max for accelerometer?
                //max:
                // srcX.addDataHandler(new RunningExtremaHandler(new Speech(), -1))
                //slope for min
                srcX.addDataHandler(new SlopeParityHandler(new Speech(), -1))
                //min
                // srcX.addDataHandler(new RunningExtremaHandler(new Speech(), 1))
                xSinkID = srcX.id
                setXSink(srcX)
            }

            /**
             * check if a sink exists to stream Y axis data to. else create one.
             */
            if (!srcY) {
                srcY = OutputEngine.getInstance().addSink('jacdac accelerometer Y axis')
                console.log(`added sink to stream y axis data ${ySink}`)
                srcY.addDataHandler(new NoteHandler([-1, 1], 1))
                // src.addDataHandler(new FilterRangeHandler(new NoiseSonify(), [-1, 0]))
                // dummy stats. Do we know the min and max for accelerometer?
                ySinkID = srcY.id
                setYSink(srcY)
            }

            /**
             * check if a sink exists to stream Z axis data to. else create one.
             */
            if (!srcZ) {
                srcZ = OutputEngine.getInstance().addSink('jacdac accelerometer Z axis')
                console.log(`added sink to stream z axis data ${zSink}`)
                // srcZ.addDataHandler(new NoteHandler([-1,1],0))
                // src.addDataHandler(new FilterRangeHandler(new NoiseSonify(), [-1, 0]))
                // dummy stats. Do we know the min and max for accelerometer?
                //max:
                // srcZ.addDataHandler(new RunningExtremaHandler(new Speech(), 1))
                //min
                // srcZ.addDataHandler(new RunningExtremaHandler(new Speech(), 1))
                zSinkID = srcZ.id
                setZSink(srcZ)
            }
            /**
             * check if a observable exists for each of the axes.
             * If not, create an RXJS Subject, filter out null values and change it to be typed as observable<datum>, and then set this as a stream for the source.
             */

            let sourceX = xAxisStream
            if (!sourceX) {
                sourceX = new Subject<Datum>()
                setXAxisStream(sourceX)
                OutputEngine.getInstance().setStream(xSinkID, sourceX.pipe(filterNullish()))
            }

            let sourceY = yAxisStream
            if (!sourceY) {
                sourceY = new Subject<Datum>()
                setYAxisStream(sourceY)
                OutputEngine.getInstance().setStream(ySinkID, sourceY.pipe(filterNullish()))
            }

            let sourceZ = zAxisStream
            if (!sourceZ) {
                sourceZ = new Subject<Datum>()
                setZAxisStream(sourceZ)
                OutputEngine.getInstance().setStream(zSinkID, sourceZ.pipe(filterNullish()))
            }

            OutputEngine.getInstance().next(OutputStateChange.Play)
        } else {
            OutputEngine.getInstance().next(OutputStateChange.Stop)
        }
    }

    console.log("STREAMING STATE: ", streaming)

    return (
        <>
            <Button onClick={handleConnect}>{bus?.connected ? 'Disconnect' : 'Connect'}</Button>
            {bus && (
                <Button onClick={handleStartStreaming} disabled={services.length === 0}>
                    {streaming ? 'Stop streaming' : 'Start streaming'}
                </Button>
            )}
            {buttons &&
                buttons.map((button,i) => <MicroBitButton key={i} service={button} outputEngine={OutputEngine.getInstance()}/>)}
        </>
    )
}

export default function Page() {
    return (
        <JacdacProvider initialBus={bus}>
            <ConnectButton />
        </JacdacProvider>
    )
}
