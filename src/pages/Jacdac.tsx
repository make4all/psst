import React, { FC, useState, useEffect } from 'react'
// import ConnectButton from "../../jacdac-docs/src/components/buttons/ConnectButton"

// import { JDBus } from "jacdac-ts/src/jdom/bus"

import { SRV_ACCELEROMETER, REPORT_UPDATE, throttle, startDevTools, inIFrame } from 'jacdac-ts'
import { useServices, useChange, useBus } from 'react-jacdac'
import { Button } from '@mui/material'
import { OutputEngine } from '../sonification/OutputEngine'
import { JacdacProvider } from 'react-jacdac'
import { bus } from '../bus'
import { DataSink } from '../sonification/DataSink'
import { NoteHandler } from '../sonification/handler/NoteHandler'
import { OutputStateChange } from '../sonification/OutputConstants'
import { filter, Observable, OperatorFunction, pipe, Subject, UnaryFunction } from 'rxjs'
import { Datum } from '../sonification/Datum'

const TONE_THROTTLE = 100

/**
 * helper function to filter out null values from subjects, and create an observable<Datum> for the sink to subscribe.
 * Source: https://stackoverflow.com/questions/57999777/filter-undefined-from-rxjs-observable
 * @returns observable <datum>
 */

 function filterNullish<T>(): UnaryFunction<Observable<T | null | undefined>, Observable<T>> {
    return pipe(
      filter(x => x != null) as OperatorFunction<T | null |  undefined, T>
    );
  }

function ConnectButton() {
    const bus = useBus()
    const connected = useChange(bus, (_) => _.connected)
    const services = useServices({ serviceClass: SRV_ACCELEROMETER })
    const [streaming, setStreaming] = useState(false)
    const [sink, setSink] = useState<DataSink>()
    const [xAxisStream, setXAxisStream] = useState<Subject<Datum>>()
    const [yAxisStream, setYAxisStream] = useState<Subject<Datum>>()

    useEffect(() => {
        if (!inIFrame() && window.location.hash === '#dbg') startDevTools()
    }, [])

    // register for accelerometer data events
    useEffect(() => {
        if (!services || services.length === 0) return
        const accelService = services[0]

        console.log(accelService.specification)
        const unsubs = accelService.readingRegister.subscribe(
            REPORT_UPDATE,
            // don't trigger more than every 100ms
            throttle(async () => {
                if (!streaming || !sink) return
                const [x, y, z] = accelService.readingRegister.unpackedValue
                console.log('vpotluri: calling PushPoint.')
                if(sink && xAxisStream) xAxisStream.next(new Datum(sink.id,x))
                // OutputEngine.getInstance().pushPoint(x, sink.id)
            }, TONE_THROTTLE),
        )

        // cleanup callback
        return () => unsubs?.()
    }, [services])

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
        let sinkID:number = 0;
        let src = sink
        if (!streaming) {
            if (!src) {
                src = OutputEngine.getInstance().addSink('jacdac demo')
                src.addDataHandler(new NoteHandler([-1,1],-1))
                // src.addDataHandler(new FilterRangeHandler(new NoiseSonify(), [-1, 0]))
                // dummy stats. Do we know the min and max for accelerometer?
                sinkID = src.id;
                setSink(src)


            }

            let sourceX = xAxisStream;
            if(!sourceX)
            {
                sourceX = new Subject<Datum>();
                setXAxisStream(sourceX)
                OutputEngine.getInstance().setStream(sinkID,sourceX.pipe(filterNullish()))

            }

            OutputEngine.getInstance().next(OutputStateChange.Play)
        } else {
            OutputEngine.getInstance().next(OutputStateChange.Stop)
        }

        setStreaming(!streaming)
    }

    return (
        <>
            <Button onClick={handleConnect}>{bus?.connected ? 'Disconnect' : 'Connect'}</Button>
            {bus && (
                <Button onClick={handleStartStreaming} disabled={services.length === 0}>
                    {streaming ? 'Stop streaming' : 'Start streaming'}
                </Button>
            )}
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
