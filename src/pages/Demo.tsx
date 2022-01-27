import { Sonifier } from '../sonification/Sonifier'

import React, { ChangeEvent } from 'react'

import { PlaybackState, SonificationLevel } from '../sonification/SonificationConstants'
import { ImportView } from '../views/ImportView'
import { DataView } from '../views/DataView'
import { ChartView } from '../views/ChartView'

import { FormControl, InputLabel, Select, SelectChangeEvent, MenuItem, Grid, NativeSelect } from '@mui/material'

import { DataManager } from '../DataManager'


import { IDemoView } from '../views/demos/IDemoView'
import { DemoSimple } from '../views/demos/DemoSimple'
import { DemoHighlightRegion } from '../views/demos/DemoHighlightRegion'
import { op } from 'arquero'
import { ExperimentalDemoHighlightRegion } from '../views/demos/ExperimentalDemoHighlightRegion'

const DEMO_VIEW_MAP = {
    simple: { value: 'simple', label: 'Simple sonification', component: DemoSimple },
    highlightRegion: { value: 'highlightRegion', label: 'Highlight points for region', component: DemoHighlightRegion },
    experimentalHighlightRegion: {
        value: 'experimentalHighlightRegion',
        label: 'experimental implementation of highlight points for region',
        component: ExperimentalDemoHighlightRegion,
    },
}

let demoViewRef: React.RefObject<DemoSimple<DemoProps, DemoState> | DemoHighlightRegion> = React.createRef()
export interface DemoState {
    dataSummary: any
    columnList: string[]
    columnSelected: string
    demoViewValue: string
    playbackLabel: string
}

export interface DemoProps {}

export class Demo extends React.Component<DemoProps, DemoState> {
    constructor(props: DemoProps) {
        super(props)
        this.state = {
            dataSummary: { min: 300, max: 500, median: 400, mean: 400, count: 200 },
            demoViewValue: 'simple',
            playbackLabel: 'play',
            columnSelected: 'Value',
            columnList: ['Value'],
        }

        DataManager.getInstance().addListener(this._handleDataChange)
    }

    public render() {
        const { demoViewValue, dataSummary, playbackLabel, columnSelected, columnList } = this.state

        const DemoComponent = DEMO_VIEW_MAP[demoViewValue].component

        return (
            <div>
                <h1> basic sonification demo</h1>
                <div>
                    <ImportView />
                </div>

                <div>
                    <DataView />
                </div>

                <div>
                    <ChartView />
                </div>

                <div style={{ marginTop: '20px' }}>
                    <Grid container spacing={2}>
                        <Grid item xs={8} sm={4} md={4}>
                            <FormControl>
                                <InputLabel variant="standard" htmlFor="data-column-select" id="data-column-label">
                                    Select Data Column
                                </InputLabel>
                                <NativeSelect
                                    aria-label="Select data column to sonify"
                                    id="data-column-select"
                                    variant="standard"
                                    value={columnSelected}
                                    onChange={this._handleColumnSelectChange}
                                >
                                    {columnList.map((column) => (
                                        <option value={column} key={column}>
                                            {column}
                                        </option>
                                    ))}
                                </NativeSelect>
                            </FormControl>
                        </Grid>
                    </Grid>
                </div>
                <div style={{ marginTop: '20px' }}>
                    {/* <textarea value={editorText}onChange={handleEditorChange}/>  */}
                    {/* <Editor height="90vh" defaultLanguage="javascript" defaultValue={editorText} onChange={handleEditorChange} /> */}
                    <Grid container spacing={2}>
                        <Grid item xs={8} sm={4} md={4}>
                            <FormControl>
                                <InputLabel variant="standard" htmlFor="demo-view-select" id="demo-view-label">
                                    Sonification Demo
                                </InputLabel>
                                <NativeSelect
                                    aria-label="Choose demo"
                                    id="demo-view-select"
                                    value={demoViewValue}
                                    onChange={this._handleDemoViewValueChange}
                                >
                                    {Object.values(DEMO_VIEW_MAP).map((e) => (
                                        <option value={e.value} key={e.value}>
                                            {e.label}
                                        </option>
                                    ))}
                                </NativeSelect>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={8} md={8}>
                            {<DemoComponent ref={demoViewRef} dataSummary={dataSummary} />}
                        </Grid>
                    </Grid>

                    <button onClick={this._handlePlayButton}>{playbackLabel}</button>
                    <p>
                        Press the interrupt with random data button when a tone is playing to override what is playing
                        with random data.
                    </p>
                </div>
            </div>
        )
    }

    private _handleDataChange = (data: any) => {
        // Get all column names
        let columnList = data.columnNames(),
            exampleRow = data.object()

        if (columnList.length > 0 && exampleRow) {
            // Filter out columns that are not numerical types
            columnList = columnList.filter((column) => typeof exampleRow[column] === 'number')

            if (columnList.length > 0) {
                const columnSelected = columnList[0]
                let dataSummary = this._computeDataSummary(data, columnSelected)

                this.setState({ dataSummary, columnList, columnSelected })
            }
        }
    }

    private _computeDataSummary = (data: any, columnSelected: string) => {
        const dataSummary = data
            .rollup({
                mean: op.mean(columnSelected),
                min: op.min(columnSelected),
                max: op.max(columnSelected),
                median: op.median(columnSelected),
                count: op.count(),
            })
            .object()
        return dataSummary
    }

    private _handlePlayButton = () => {
        // This is old code for getting the data values from a TextEdit HTML element
        // var data: number[] = []
        // var dataText: string[] = editorText.split(',')
        // console.log("sonificationOption when play button handeler is entered",sonificationOption)

        // for (let i = 0; i < dataText.length; i++) {
        //     data.push(parseInt(dataText[i]))
        // }
        const sonifierInstance = Sonifier.getSonifierInstance()

        if (sonifierInstance) {
            console.log('sonifier instance is present. playback state', sonifierInstance.playbackState)
            if (sonifierInstance.playbackState == PlaybackState.Playing) return
            sonifierInstance.onPlay()
        }

        let table = DataManager.getInstance().table

        if (table) {
            // Hardcode getting the "Value" column from each data table, this will need to be set by user later
            let data = table.columns()[this.state.columnSelected].data

            if (demoViewRef.current) {
                let demoView: IDemoView = demoViewRef.current
                demoView.onPlay(data)
            }
        }
    }

    private _handlePlaybackStateChanged = (e: PlaybackState) => {
        console.log('handlePlaybackStateChanged', e)
        let playbackLabel
        switch (e) {
            case PlaybackState.Playing:
                playbackLabel = 'pause'
                break
            case PlaybackState.Paused:
                playbackLabel = 'resume'
                break
            default:
                playbackLabel = 'play'
                break
        }
        this.setState({ playbackLabel })

        console.log('returning. play button label', playbackLabel)
    }

    // private _handlePushRudeData = () => {
    //     let sonifierInstance = Sonifier.getSonifierInstance()
    //     if (sonifierInstance) {
    //         for (let i = 0; i < 5; i++) {
    //             let dataPoint: number = Math.random()
    //             dataPoint = dataPoint * 10000
    //             sonifierInstance.SonifyPushedPoint(dataPoint, SonificationLevel.assertive)
    //         }
    //     }
    // }

    private _handleDemoViewValueChange = (event: ChangeEvent<HTMLSelectElement>) => {
        let demoViewValue = event.target.value
        this.setState({ demoViewValue })
    }

    private _handleColumnSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
        console.log('change column selected', event.target.value)
        const columnSelected = event.target.value

        let table = DataManager.getInstance().table

        if (table) {
            // Hardcode getting the "Value" column from each data table, this will need to be set by user later
            const dataSummary = this._computeDataSummary(table, columnSelected)
            this.setState({ columnSelected, dataSummary })
        }
    }
}
