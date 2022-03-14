import React from 'react'

import { TextField } from '@mui/material'
import { IDemoView } from './IDemoView'
import { SlopeParityHandler } from '../../sonification/handler/SlopeParityHandler'
import { FileOutput } from '../../sonification/output/FileOutput'
import { DemoSimple, DemoSimpleProps, DemoSimpleState } from './DemoSimple'
import { NoteHandler } from '../../sonification/handler/NoteHandler'
import { OutputEngine } from '../../sonification/OutputEngine'
import { Box, Button, Input } from '@mui/material'
import { NoteSonify } from '../../sonification/output/NoteSonify'

const DEBUG = false

export interface DemoSlopeParityV2Props extends DemoSimpleProps {
    dataSummary: any
}

// V2: indicate when the slope is increasing vs decreasing with separate notifications
export class DemoSlopeParityV2 extends DemoSimple<DemoSlopeParityV2Props, DemoSimpleState> implements IDemoView {
    increasingTracker: SlopeParityHandler | undefined
    decreasingTracker: SlopeParityHandler | undefined
    private _inputFile: React.RefObject<HTMLInputElement>
    private _increasingBuffer: ArrayBuffer | undefined
    private _decreasingBuffer: ArrayBuffer | undefined

    constructor(props: DemoSlopeParityV2Props) {
        super(props)
        this._inputFile = React.createRef()
    }

    public render() {
        return (
            <div>
                <label htmlFor="input-upload-file" aria-label="Choose file">
                    <Box component="div" sx={{ p: 2, border: '2px dashed #aaa', mb: 2 }}>
                        <Button component="label">
                            Upload notification for increasing
                            <Input
                                style={{ display: 'none' }}
                                aria-hidden={true}
                                ref={this._inputFile}
                                type="file"
                                id="input-upload-file"
                                onChange={(e) => this._handleFileChange(e, 1)}
                            />
                        </Button>
                    </Box>
                </label>
                <label htmlFor="input-upload-file" aria-label="Choose file">
                    <Box component="div" sx={{ p: 2, border: '2px dashed #aaa', mb: 2 }}>
                        <Button component="label">
                            Upload notification for decreasing
                            <Input
                                style={{ display: 'none' }}
                                aria-hidden={true}
                                ref={this._inputFile}
                                type="file"
                                id="input-upload-file"
                                onChange={(e) => this._handleFileChange(e, -1)}
                            />
                        </Button>
                    </Box>
                </label>
            </div>
        )
    }

    private _handleFileChange = (event: React.FormEvent<HTMLElement>, direction: number) => {
        if (DEBUG) console.log('file changed!')
        let target: any = event.target
        if (target && target.files && target.files.length === 1) {
            console.log(event)
            let file: File = target.files[0]
            // process file
            file.arrayBuffer()
                .then((buffer) => {
                    // if (DEBUG) console.log(buffer.byteLength)
                    // byte length is not 0 from console.log statements
                    if (direction == 1) {
                        this._increasingBuffer = buffer
                    } else {
                        this._decreasingBuffer = buffer
                    }
                    if (DEBUG) console.log('updated buffer for', direction)
                })
                .catch(console.error)
        }
    }

    ////////// HELPER METHODS ///////////////
    public initializeSink() {
        this.sink = OutputEngine.getInstance().addSink('DemoSlopeParityV2')
        this.increasingTracker = new SlopeParityHandler(1, new FileOutput(this._increasingBuffer))
        this.decreasingTracker = new SlopeParityHandler(-1, new FileOutput(this._decreasingBuffer))
        if (DEBUG) console.log('sink initialized')
        this.sink.addDataHandler(this.increasingTracker)
        this.sink.addDataHandler(this.decreasingTracker)
        this.sink.addDataHandler(new NoteHandler(undefined, new NoteSonify()))
        return this.sink
    }
}
