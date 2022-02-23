import React from 'react'

import { TextField } from '@mui/material'
import { IDemoView } from './IDemoView'
import { SlopeParityHandler } from '../../sonification/handler/SlopeParityHandler'
import { FileOutput } from '../../sonification/output/FileOutput'
import { DemoSimple, DemoSimpleProps, DemoSimpleState } from './DemoSimple'
import { NoteHandler } from '../../sonification/handler/NoteHandler'
import { OutputEngine } from '../../sonification/OutputEngine'
import { Box, Button, Input } from '@mui/material'

const DEBUG = true

export interface DemoSlopeParityV1State extends DemoSimpleState {
    targetValues : number[]
}
export interface DemoSlopeParityV1Props extends DemoSimpleProps {
    dataSummary: any
}

export class DemoSlopeParityV1
    extends DemoSimple<DemoSlopeParityV1Props, DemoSlopeParityV1State>
    implements IDemoView
{
    filter: SlopeParityHandler | undefined
    private _inputFile: React.RefObject<HTMLInputElement>
    private _buffer: ArrayBuffer | undefined

    constructor(props: DemoSlopeParityV1Props) {
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
            </div>
        )
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
        this.sink = OutputEngine.getInstance().addSink('DemoSlopeParityV1')
        this.filter = new SlopeParityHandler(new FileOutput(this._buffer))
        if (DEBUG) console.log("sink initialized")
        this.sink.addDataHandler(new NoteHandler())
        this.sink.addDataHandler(this.filter)
        return this.sink
    }
}