import React from 'react'

import { TextField } from '@mui/material'
import { IDemoView } from './IDemoView'
import { NotificationHandler } from '../../sonification/handler/NotificationHandler'
import { FileOutput } from '../../sonification/output/FileOutput'
import { DemoSimple, DemoSimpleProps, DemoSimpleState } from './DemoSimple'
import { NoteHandler } from '../../sonification/handler/NoteHandler'
import { OutputEngine } from '../../sonification/OutputEngine'
import { Box, Button, Input } from '@mui/material'

const DEBUG = true

export interface DemoFileOutputState extends DemoSimpleState {
    targetValues : number[]
}
export interface DemoFileOutputProps extends DemoSimpleProps {
    dataSummary: any
}

export class DemoFileOutput
    extends DemoSimple<DemoFileOutputProps, DemoFileOutputState>
    implements IDemoView
{
    filter: NotificationHandler | undefined
    private _inputFile: React.RefObject<HTMLInputElement>
    private _buffer: ArrayBuffer | undefined

    constructor(props: DemoFileOutputProps) {
        super(props)
        this.state = {
            // currently just chooses max as the default
            targetValues: [this.props.dataSummary.max]
        }
        this._inputFile = React.createRef()
    }

    public render() {
        const { targetValues } = this.state

        return (
            <div>
                <label htmlFor="input-upload-file" aria-label="Choose file">
                    <Box component="div" sx={{ p: 2, border: '2px dashed #aaa', mb: 2 }}>
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
                    id="text-values"
                    aria-label="Enter the target value"
                    label="Points of interest"
                    variant="outlined"
                    onChange={(e) => this._handleValueChange(e.target.value)}
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
            let targetValues = [this.props.dataSummary.max]
            this.setState({ targetValues })
        }
        if (this.filter) this.filter.interestPoints = this.state.targetValues
    }

    private _handleValueChange = (value: string) => {
        let values = value.split(',')
        let targets : number[] = []
        for (let val of values) {
            let numb = parseFloat(val)
            if (!isNaN(numb)) {
                targets.push(numb)
            }
        }
        this.setState({ targetValues: targets})
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
        this.filter = new NotificationHandler(new FileOutput(this._buffer), this.state.targetValues)
        if (DEBUG) console.log("sink initialized")
        //this.sink.addDataHandler(new NoteHandler())
        this.sink.addDataHandler(this.filter)
        return this.sink
    }
}
