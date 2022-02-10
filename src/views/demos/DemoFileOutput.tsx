import React from 'react'

import { TextField } from '@mui/material'
import { IDemoView } from './IDemoView'
import { FilterRangeHandler } from '../../sonification/handler/FilterRangeHandler'
import { FileOutput } from '../../sonification/output/FileOutput'
import { DemoSimple, DemoSimpleProps, DemoSimpleState } from './DemoSimple'
import { NoteHandler } from '../../sonification/handler/NoteHandler'
import { OutputEngine } from '../../sonification/OutputEngine'
import { Box, Button, Input } from '@mui/material'

const DEBUG = true

export interface DemoFileOutputState extends DemoSimpleState {
    minValue: number
    maxValue: number
}
export interface DemoFileOutputProps extends DemoSimpleProps {
    dataSummary: any
}

export class DemoFileOutput
    extends DemoSimple<DemoFileOutputProps, DemoFileOutputState>
    implements IDemoView
{
    filter: FilterRangeHandler | undefined
    private _inputFile: React.RefObject<HTMLInputElement>
    private _buffer: ArrayBuffer | undefined

    constructor(props: DemoFileOutputProps) {
        super(props)
        this.state = {
            minValue: this.props.dataSummary.min,
            maxValue: this.props.dataSummary.max,
        }
        this._inputFile = React.createRef()
    }

    public render() {
        const { minValue, maxValue } = this.state

        return (
            <div>
                <label htmlFor="input-upload-file" aria-label="Choose file">
                    <Box component="div" sx={{ p: 2, border: '2px dashed #aaa' }}>
                        <Button component="label">
                            Upload
                            <Input
                                style={{ display: 'none' }}
                                aria-hidden={true}
                                ref={this._inputFile}
                                type="file"
                                id="input-upload-file"
                                onChange={this._handleFileChange}
                            />
                        </Button>
                    </Box>
                </label>
                <TextField
                    id="text-min-value"
                    aria-label="Enter minimum value"
                    label="Min"
                    variant="outlined"
                    type="number"
                    value={isNaN(minValue) ? '' : minValue}
                    onChange={(e) => this._handleValueChange(parseFloat(e.target.value), 'min')}
                />
                <TextField
                    id="text-max-value"
                    aria-label="Enter maximum value"
                    label="Max"
                    variant="outlined"
                    type="number"
                    value={isNaN(maxValue) ? '' : maxValue}
                    onChange={(e) => this._handleValueChange(parseFloat(e.target.value), 'max')}
                />
            </div>
        )
    }

    /**
     * @param prevProps new min/max value
     */
    public componentDidUpdate(prevProps: DemoFileOutputProps) {
        // When the data summary changes, update the min & max value
        if (
            this.props.dataSummary.min !== prevProps.dataSummary.min ||
            this.props.dataSummary.max !== prevProps.dataSummary.max
        ) {
            let minValue = this.props.dataSummary.min,
                maxValue = this.props.dataSummary.max
            this.setState({ minValue, maxValue })
        }
        if (this.filter) this.filter.range = [this.state.minValue, this.state.maxValue]
    }

    private _handleValueChange = (value: number, which: string) => {
        switch (which) {
            case 'min':
                this.setState({ minValue: value })
                break
            case 'max':
                this.setState({ maxValue: value })
                break
        }
    }

    private _handleFileChange = (event: React.FormEvent<HTMLElement>) => {
      if (DEBUG) console.log("file changed!")
      let target: any = event.target
      if (target && target.files && target.files.length === 1) {
          console.log(event)
          let file: File = target.files[0]
          // process file
          file.arrayBuffer().then((buffer) => {
            // if (DEBUG) console.log(buffer.byteLength)
            // byte length is not 0 from console.log statements
            this._buffer = buffer
            if (DEBUG) console.log("buffer updated!")
          }).catch(console.error)
      }
    }

    ////////// HELPER METHODS ///////////////
    public initializeSink() {
        this.sink = OutputEngine.getInstance().addSink('FileOutputDemo')
        this.filter = new FilterRangeHandler(this.sink, new FileOutput(this._buffer), [
            this.state.minValue,
            this.state.maxValue,
        ])
        if (DEBUG) console.log("sink initialized")
        // this.sink.addDataHandler(new NoteHandler(this.sink))
        this.sink.addDataHandler(this.filter)
        return this.sink
    }
}
