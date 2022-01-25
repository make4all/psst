import React, { FC, useState, useEffect } from 'react'
// import ConnectButton from "../../jacdac-docs/src/components/buttons/ConnectButton"

// import { JDBus } from "jacdac-ts/src/jdom/bus"

import { JDBus, JDDevice, SRV_ACCELEROMETER, REPORT_UPDATE, throttle, startDevTools, inIFrame } from 'jacdac-ts'
import { useServices, useChange, useBus } from 'react-jacdac'
import { Button } from '@mui/material'
import { Sonifier } from '../sonification/Sonifier'
import { JacdacProvider } from 'react-jacdac'
import { bus } from '../bus'

const TONE_THROTTLE = 100

function ConnectButton() {
    const bus = useBus()
    const connected = useChange(bus, (_) => _.connected)
    const services = useServices({ serviceClass: SRV_ACCELEROMETER })
    const [sonifier, setSonifier] = useState<Sonifier>()
    const [streaming, setStreaming] = useState(false)

    useEffect(()=>{
        if (!inIFrame())
            startDevTools()
    },[])

    // register for accelerometer data events
    useEffect(() => {
        if (!services || services.length === 0) return
        const accelService = services[0]

        const unsubs = accelService.readingRegister.subscribe(
            REPORT_UPDATE,
            // don't trigger more than every 100ms
            throttle(async () => {
                if (!streaming || !sonifier) return
                const [x, y, z] = accelService.readingRegister.unpackedValue
                sonifier.pushPoint(x, 0)
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
            let jd = bus
            await jd.connect()
        }
    }

    const handleStartStreaming = () => {
        if (!sonifier) setSonifier(Sonifier.getSonifierInstance())
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
