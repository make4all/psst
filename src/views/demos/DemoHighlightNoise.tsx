import React from 'react'
import { TextField } from '@mui/material'

import { IDemoView } from './IDemoView'
import { Sonifier } from '../../sonifier'

import { SonificationLevel } from '../../constents'

export interface DemoHighlightNoiseState {
    highlightValue: number
}

export interface DemoHighlightNoiseProps {
    dataSummary: any
}

export class DemoHighlightNoise
    extends React.Component<DemoHighlightNoiseProps, DemoHighlightNoiseState>
    implements IDemoView
{
    constructor(props: DemoHighlightNoiseProps) {
        super(props)

        this.state = {
            highlightValue: this.props.dataSummary.mean,
        }
    }

    public onPause = (data: any) => {}

    public onPlay = (data: any) => {
        let sonifierInstance = Sonifier.getSonifierInstance()
        let { highlightValue } = this.state
        // sonifierInstance.playHighlightPointsWithNoise(data, highlightValue)
    }

    public render() {
        const { highlightValue } = this.state

        return (
            <div>
                <TextField
                    id="text-highlight-value"
                    aria-label="Enter highlight value"
                    label="Highlight"
                    type="number"
                    variant="outlined"
                    value={isNaN(highlightValue) ? '' : highlightValue}
                    onChange={this._handleValueChange}
                />
            </div>
        )
    }

    public componentDidUpdate(prevProps: DemoHighlightNoiseProps) {
        // When the data summary changes, update the highlight value
        if (this.props.dataSummary.mean !== prevProps.dataSummary.mean) {
            let highlightValue = this.props.dataSummary.mean
            this.setState({ highlightValue })
        }
    }

    // componentDidMount() is invoked immediately after a component is mounted (inserted into the tree).
    // Initialization that requires DOM nodes should go here. If you need to load data from a remote endpoint,
    // this is a good place to instantiate the network request.
    public componentDidMount() {}

    // componentWillUnmount() is invoked immediately before a component is unmounted and destroyed.
    // Perform any necessary cleanup in this method, such as invalidating timers, canceling network requests,
    // or cleaning up any subscriptions
    public componentWillUnmount() {}

    private _handleValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        let highlightValue = parseFloat(event.target.value)
        this.setState({ highlightValue })
    }
}
