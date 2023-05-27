import React, { FC, useState, useEffect, useRef } from 'react'
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
import { RunningExtremaHandler } from '../sonification/handler/RunningExtremaHandler'
import { SlopeParityHandler } from '../sonification/handler/SlopeParityHandler'
import { Speech } from '../sonification/output/Speech'
import { NoteSonify } from '../sonification/output/NoteSonify'

const TONE_THROTTLE = 100

/**
 * helper function to filter out null values from subjects, and create an observable<Datum> for the sink to subscribe.
 * Source: https://stackoverflow.com/questions/57999777/filter-undefined-from-rxjs-observable
 * @returns observable <datum>
 */

function filterNullish<T>(): UnaryFunction<Observable<T | null | undefined>, Observable<T>> {
    return pipe(filter((x) => x != null) as OperatorFunction<T | null | undefined, T>)
}

/**
 * Helper function to copy data to the clipboard and remove data from the clipboard.
 * @param {Object} props - Component props
 * @param {Array} props.xData - X data array
 * @param {Array} props.yData - Y data array
 * @param {Array} props.zData - Z data array
 * @param {Object} props.textareaRef - Reference to the textarea element
 * @param {Function} props.setCopied - Setter function for the copied state
 * @param {boolean} props.copied - Copied state indicating whether the data has been copied
 * @param {Function} props.setXStreamData - Setter function for the X stream data
 * @param {Function} props.setYStreamData - Setter function for the Y stream data
 * @param {Function} props.setZStreamData - Setter function for the Z stream data
 * @returns {JSX.Element} - Copy to clipboard button component
 */

function CopyToClipboardButton(props) {
    const { xData, yData, zData, textareaRef, setCopied, copied, setXStreamData, setYStreamData, setZStreamData } =
        props
    const dataExists = xData.length > 0 || yData.length > 0 || zData.length > 0
    const dataRows: string[] = []
    const [totalCount, setTotalCount] = useState(0)
    const copyToClipboard = async () => {
        if (!dataExists || !textareaRef.current) return
        const header = 'x,y,z'

        if (dataExists) {
            const maxLength = Math.max(xData.length, yData.length, zData.length)
            for (let i = 0; i < maxLength; i++) {
                const xValue = xData[i]?.value ?? ''
                const yValue = yData[i]?.value ?? ''
                const zValue = zData[i]?.value ?? ''
                dataRows.push(`${xValue},${yValue},${zValue}`)
            }
        }

        const csv = [header, ...dataRows].join('\n')

        textareaRef.current.value = csv
        textareaRef.current.select()
        try {
            await navigator.clipboard.writeText(csv)
            setCopied(true)
            setTotalCount(dataRows.length)
        } catch (error) {
            console.error('Failed to copy to clipboard:', error)
        }
    }

    const removeFromClipboard = () => {
        if (textareaRef.current) {
            textareaRef.current.value = ''
            navigator.clipboard.writeText('') // Clear the clipboard
            setCopied(false)
            setTotalCount(0)
        }
        // Clear the input stream data
        setXStreamData([])
        setYStreamData([])
        setZStreamData([])
    }

    useEffect(() => {
        if (copied) {
            const timeout = setTimeout(() => setCopied(false), 2000)
            return () => clearTimeout(timeout)
        }
    }, [copied])

    return (
        <>
            <Button onClick={copyToClipboard} disabled={!dataExists}>
                {copied ? 'Copied!' : 'Copy to Clipboard'}
            </Button>
            <Button onClick={removeFromClipboard} disabled={!dataExists}>
                Remove from Clipboard
            </Button>
            <p>Total values collected: {totalCount}</p> {/* Display the total count */}
            <textarea ref={textareaRef} style={{ position: 'absolute', left: -9999 }} readOnly />
        </>
    )
}

function ConnectButton() {
    const bus = useBus()
    const connected = useChange(bus, (_) => _.connected)
    const services = useServices({ serviceClass: SRV_ACCELEROMETER })
    const [streaming, setStreaming] = useState(false)
    const [xSink, setXSink] = useState<DataSink>()
    const [ySink, setYSink] = useState<DataSink>()
    const [zSink, setZSink] = useState<DataSink>()
    const [xAxisStream, setXAxisStream] = useState<Subject<Datum>>()
    const [yAxisStream, setYAxisStream] = useState<Subject<Datum>>()
    const [zAxisStream, setZAxisStream] = useState<Subject<Datum>>()
    const [xStreamData, setXStreamData] = useState<Datum[]>([])
    const [yStreamData, setYStreamData] = useState<Datum[]>([])
    const [zStreamData, setZStreamData] = useState<Datum[]>([])
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        if (!inIFrame() && window.location.hash === '#dbg') startDevTools()
    }, [])

    useEffect(() => {
        if (streaming && xSink && xAxisStream && ySink && yAxisStream && zSink && zAxisStream) {
            const xSubscription = xAxisStream.subscribe((datum) => {
                setXStreamData((prevData) => [...prevData, datum])
            })
            const ySubscription = yAxisStream.subscribe((datum) => {
                setYStreamData((prevData) => [...prevData, datum])
            })
            const zSubscription = zAxisStream.subscribe((datum) => {
                setZStreamData((prevData) => [...prevData, datum])
            })

            return () => {
                xSubscription.unsubscribe()
                ySubscription.unsubscribe()
                zSubscription.unsubscribe()
            }
        }
    }, [streaming, xAxisStream, yAxisStream, zAxisStream])

    // register for accelerometer data events
    useEffect(() => {
        if (!services || services.length === 0) return
        const accelService = services[0]

        console.log(accelService.specification)
        const unsubs = accelService.readingRegister.subscribe(
            REPORT_UPDATE,
            // don't trigger more than every 100ms
            throttle(async () => {
                if (!streaming || !xSink || !ySink || !zSink) return
                const [x, y, z] = accelService.readingRegister.unpackedValue
                console.log('vpotluri: calling PushPoint.')
                if (xSink && xAxisStream) xAxisStream.next(new Datum(xSink.id, x))
                if (ySink && yAxisStream) yAxisStream.next(new Datum(ySink.id, y))
                if (zSink && zAxisStream) zAxisStream.next(new Datum(zSink.id, z))
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
        console.log('entering handel stream')
        let xSinkID: number = 0
        let ySinkID: number = 1
        let zSinkID: number = 2
        let srcX = xSink
        let srcY = ySink
        let srcZ = zSink
        if (!streaming) {
            console.log('streaming was false')
            /**
             * check if a sink exists to stream X axis data to. else create one.
             */
            if (!srcX) {
                srcX = OutputEngine.getInstance().addSink('jacdac accelerometer X axis')
                console.log(`added sink to stream x axis data ${xSink}`)
                srcX.addDataHandler(new NoteHandler([-1, 1], new NoteSonify(-1)))
                // src.addDataHandler(new FilterRangeHandler([-1, 0], new NoiseSonify()))
                // dummy stats. Do we know the min and max for accelerometer?
                //max:
                // srcX.addDataHandler(new RunningExtremaHandler(-1, new Speech()))
                //slope for min
                srcX.addDataHandler(new SlopeParityHandler(-1, new Speech()))
                //min
                // srcX.addDataHandler(new RunningExtremaHandler(1, new Speech()))
                xSinkID = srcX.id
                setXSink(srcX)
            }

            /**
             * check if a sink exists to stream Y axis data to. else create one.
             */
            if (!srcY) {
                srcY = OutputEngine.getInstance().addSink('jacdac accelerometer Y axis')
                console.log(`added sink to stream y axis data ${ySink}`)
                srcY.addDataHandler(new NoteHandler([-1, 1], new NoteSonify(1)))
                // src.addDataHandler(new FilterRangeHandler([-1, 0], new NoiseSonify()))
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
                // srcZ.addDataHandler(new NoteHandler([-1,1], new NoteSonify(0)))
                // src.addDataHandler(new FilterRangeHandler([-1, 0], new NoiseSonify()))
                // dummy stats. Do we know the min and max for accelerometer?
                //max:
                // srcZ.addDataHandler(new RunningExtremaHandler(1, new Speech()))
                //min
                // srcZ.addDataHandler(new RunningExtremaHandler(1, new Speech()))
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

            {
                <CopyToClipboardButton
                    xData={xStreamData}
                    yData={yStreamData}
                    zData={zStreamData}
                    textareaRef={textareaRef}
                    setCopied={setCopied}
                    copied={copied}
                    setXStreamData={setXStreamData}
                    setYStreamData={setYStreamData}
                    setZStreamData={setZStreamData}
                />
            }
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
