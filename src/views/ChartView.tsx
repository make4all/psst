import React from 'react'

import { DataManager } from '../DataManager'
import * as d3 from 'd3'
import { YoutubeSearchedForOutlined } from '@mui/icons-material'

export interface ChartViewState {
    rows: any[]
    domainX: number[]
    domainY: number[]
    margin: any
    width: number
    height: number
    fieldY: string[]
    fieldX: string
}

export interface ChartViewProps {}

export class ChartView extends React.Component<ChartViewProps, ChartViewState> {
    constructor(props: ChartViewProps) {
        super(props)
        this.state = {
            rows: [],
            domainX: [-10, 10],
            domainY: [-10, 10],
            margin: { l: 20, r: 20, b: 20, t: 20 },
            width: 1340,
            height: 500,
            fieldX: 'Time',
            fieldY: ['Value'],
        }

        DataManager.getInstance().addListener(this.handleDataUpdate)
    }

    // Private parameters
    private scaleX = d3.scaleLinear()
    private scaleY = d3.scaleLinear()
    private chartContainer: React.RefObject<HTMLDivElement> = React.createRef<HTMLDivElement>()

    public render() {
        const { rows, width, height, margin, domainX, domainY, fieldX, fieldY } = this.state

        this.scaleX.domain(domainX).range([0, width - margin.l - margin.r])
        this.scaleY.domain(domainY).range([height - margin.t - margin.b, 0])

        const ticksMajorY = this.scaleY.ticks().map((t, i) => {
            const y0 = this.scaleY(t)
            return (
                <g key={i}>
                    <path
                        d={`M0,${y0}h${this.scaleX.range()[1]}`}
                        style={{ stroke: '#999', shapeRendering: 'crispEdges' }}
                    />
                    <text x={this.scaleX(0)} y={y0} dy="0.3em" style={{ textAnchor: 'middle' }}>{t}</text>
                </g>
            )
        })

        const ticksMajorX = this.scaleX.ticks().map((t, i) => {
            const x0 = this.scaleX(t)
            return (
                <g key={i}>
                    <path
                        d={`M${x0},0v${this.scaleY.range()[0]}`}
                        style={{ stroke: '#999', shapeRendering: 'crispEdges' }}
                    />
                    <text x={x0} y={this.scaleY(0)} dy="0.7em" style={{ textAnchor: 'middle' }}>{t}</text>
                </g>
            )
        })

        const paths = fieldY.map((f, i) => {
            const line = d3
                .line()
                .x((d) => this.scaleX(d[fieldX]))
                .y((d) => this.scaleY(d[f]))
            return <path d={line(rows)} style={{ stroke: '#2d70b3', strokeWidth: 2, fill: 'none' }} />
        })

        return (
            <div ref={this.chartContainer} style={{ height: 500, width: '100%' }}>
                <svg style={{ width: '100%', height: '100%' }}>
                    <g id="chart" transform={`translate(${margin.l},${margin.t})`}>
                        <g className="axis-group">
                            <g className="axis axis-x">{ticksMajorX}</g>
                            <g className="axis axis-y">{ticksMajorY}</g>
                        </g>
                        <g className="mark-group">{paths}</g>
                    </g>
                </svg>
            </div>
        )
    }

    public componentDidMount() {
        this.handleResize();
        window.addEventListener('resize', this.handleResize);
    }

    public handleResize = (): void => {
        if (this.chartContainer && this.chartContainer.current) {
            const dimensions = this.chartContainer.current.getBoundingClientRect(),
                {width, height} = dimensions;
            this.setState({width, height});
        }
    }

    public handleDataUpdate = (table: any): void => {
        const { fieldX } = this.state
        // const columns = table
        //     .columnNames()
        //     .map((c) => ({ field: c, headerName: c, width: 160, renderHeader: (params: any) => <strong>{c}</strong> }))
        const rows = table.objects().map((o, i) => Object.assign({ id: i }, o)),
            domainX = d3.extent(rows, (d) => d[fieldX]),
            domainY = d3.extent(rows, (d) => d['Value'])

        this.setState({ rows, domainX, domainY })
    }
}
