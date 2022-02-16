import React from 'react'

import { DataManager } from '../DataManager'
import * as d3 from 'd3'
import { DataSink } from '../sonification/DataSink'
import { Datum } from '../sonification/Datum'
import { DataHandler } from '../sonification/handler/DataHandler'
import { DatumOutput } from '../sonification/output/DatumOutput'
import { ThreeDRotationSharp } from '@mui/icons-material'
// import { Sonifier } from '../sonification/Sonifier'

export interface ChartViewState {
    rows: any[]
    valuesX: number[]
    domainX: number[]
    domainY: number[]
    margin: any
    width: number
    height: number
    fieldY: string[]
    fieldX: string
    highlight: any[]
}

export interface ChartViewProps {}

export class ChartView extends React.Component<ChartViewProps, ChartViewState> {
    constructor(props: ChartViewProps) {
        super(props)
        this.state = {
            rows: [],
            valuesX: [],
            domainX: [-10, 10],
            domainY: [-10, 10],
            margin: { l: 20, r: 20, b: 20, t: 20 },
            width: 1340,
            height: 500,
            fieldX: 'Time',
            fieldY: ['Value'],
            highlight: [],
        }

        // Sonifier.getSonifierInstance().addPlaybackListener(this.handleDatumUpdate)

        DataManager.getInstance().addListener(this.handleDataUpdate)
    }

    // Private parameters
    private scaleX = d3.scaleLinear()
    private scaleY = d3.scaleLinear()

    private dataHandler: ChartDataHandler | undefined

    private chartContainer: React.RefObject<HTMLDivElement> = React.createRef<HTMLDivElement>()
    private pointHighlight: React.RefObject<SVGGElement> = React.createRef<SVGGElement>()

    public render() {
        const { rows, margin, fieldX, fieldY } = this.state

        const ticksMajorY = this.scaleY.ticks().map((t, i) => {
            const y0 = this.scaleY(t)
            return (
                <g key={i}>
                    <path
                        d={`M0,${y0}h${this.scaleX.range()[1]}`}
                        style={{ stroke: '#999', shapeRendering: 'crispEdges' }}
                    />
                    <text x={this.scaleX(0)} y={y0} dy="0.3em" style={{ textAnchor: 'middle' }}>
                        {t}
                    </text>
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
                    <text x={x0} y={this.scaleY(0)} dy="0.7em" style={{ textAnchor: 'middle' }}>
                        {t}
                    </text>
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
                <svg style={{ width: '100%', height: '100%' }} onMouseMove={this.handleMouseMove}>
                    <g id="chart" transform={`translate(${margin.l},${margin.t})`}>
                        <g className="axis-group">
                            <g className="axis axis-x">{ticksMajorX}</g>
                            <g className="axis axis-y">{ticksMajorY}</g>
                        </g>
                        <g className="mark-group">{paths}</g>
                        <g className="annotation-group">
                            <g className="highlight-point" ref={this.pointHighlight}>
                                <circle r="4" style={{ fill: '#2d70b3', strokeWidth: 0.5, stroke: '#fff' }} />
                            </g>
                        </g>
                    </g>
                </svg>
            </div>
        )
    }

    private handleMouseMove = (e: React.MouseEvent<SVGSVGElement>): void => {
        const { rows, valuesX, fieldX, fieldY } = this.state

        if (valuesX.length > 0) {
            const mx = d3.pointer(e)[0],
                i = d3.bisectCenter(valuesX, this.scaleX.invert(mx)),
                tx = this.scaleX(valuesX[i]),
                ty = this.scaleY(rows[i][fieldY[0]])

            if (this.pointHighlight.current) {
                d3.select(this.pointHighlight.current).attr('transform', `translate(${tx},${ty})`)
            }
        }
    }

    public componentDidMount() {
        this.handleResize()
        window.addEventListener('resize', this.handleResize)
    }

    public handleResize = (): void => {
        if (this.chartContainer.current) {
            const dimensions = this.chartContainer.current.getBoundingClientRect(),
                { width, height } = dimensions

            this.scaleX.range([0, width - this.state.margin.l - this.state.margin.r])
            this.scaleY.range([height - this.state.margin.t - this.state.margin.b, 0])

            this.setState({ width, height })
        }
    }

    public handleSinkUpdate = (sink: DataSink): void => {
        if (!this.dataHandler) {
            this.dataHandler = new ChartDataHandler(sink, undefined, this.handleDatumUpdate)
            sink.addDataHandler(this.dataHandler)
        }
    }

    public handleDataUpdate = (table: any): void => {
        const { fieldX } = this.state

        const rows = table.objects().map((o, i) => Object.assign({ id: i }, o)),
            valuesX = rows.map((d) => d[fieldX]),
            domainX = d3.extent(rows, (d) => d[fieldX]),
            domainY = d3.extent(rows, (d) => d['Value'])

        this.scaleX.domain(domainX)
        this.scaleY.domain(domainY)

        this.setState({ rows, valuesX, domainX, domainY })
    }

    /**
     * Stores relevant information. Value is derived from point.scaledValue.
     * @param datum The raw datum
     */
    public handleDatumUpdate = (datum?: Datum): void => {
        if (datum) {
            const { rows, valuesX, fieldX, fieldY } = this.state

            const i = datum.id

            const tx = this.scaleX(valuesX[i]),
                ty = this.scaleY(rows[i][fieldY[0]])

            if (this.pointHighlight.current) {
                d3.select(this.pointHighlight.current).attr('transform', `translate(${tx},${ty})`)
            }
        }
    }
}

// Does it make sense to create a subclass for highlighting a point? That way there could be multiple?
class ChartDataHandler extends DataHandler {
    private handleDatumCallback?: (datum?: Datum) => void

    /**
     *
     * @param sink. DataSink that is providing data to this Handler.
     * @param output An optional way to output the data
     */
    constructor(sink?: DataSink, output?: DatumOutput, handleDatumCallback?: (datum?: Datum) => void) {
        super(sink, output)
        this.handleDatumCallback = handleDatumCallback
    }

    /**
     * Adjusts the value for datum by scaling it to the range [min, max]
     * Alternatively, if datum is empty, no need to adjust since the stream is empty
     * at this point in time.
     *
     * @param datum
     * @returns Always returns true
     */
    handleDatum(datum?: Datum): boolean {
        if (!datum) return true

        if (this.handleDatumCallback) this.handleDatumCallback(datum)

        return super.handleDatum(datum)
    }

    public toString(): string {
        return `ChartDataHandler`
    }
}
