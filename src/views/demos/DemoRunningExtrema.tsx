import React from 'react'

import { TextField } from '@mui/material'
import { IDemoView } from './IDemoView'
import { RunningExtremaHandler } from '../../sonification/handler/RunningExtremaHandler'
import { DemoSimple, DemoSimpleProps, DemoSimpleState } from './DemoSimple'
import { NoteHandler } from '../../sonification/handler/NoteHandler'
import { OutputEngine } from '../../sonification/OutputEngine'
import { Box, Button, Input } from '@mui/material'
import { Speech } from '../../sonification/output/Speech'

const DEBUG = true

export interface DemoRunningExtremaProps extends DemoSimpleProps {
    dataSummary: any
}

export class DemoRunningExtrema
    extends DemoSimple<DemoRunningExtremaProps, DemoSimpleState>
    implements IDemoView
{
    minimumFilter: RunningExtremaHandler | undefined
    maximumFilter: RunningExtremaHandler | undefined

    constructor(props: DemoRunningExtremaProps) {
        super(props)
    }

    ////////// HELPER METHODS ///////////////
    public initializeSink() {
        this.sink = OutputEngine.getInstance().addSink('DemoSlopeParity')
        this.maximumFilter = new RunningExtremaHandler(new Speech(), 1)
        this.minimumFilter = new RunningExtremaHandler(new Speech(), -1)
        if (DEBUG) console.log("sink initialized")
        this.sink.addDataHandler(this.maximumFilter)
        this.sink.addDataHandler(this.minimumFilter)
        this.sink.addDataHandler(new NoteHandler())
        return this.sink
    }
}
