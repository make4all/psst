import { DataHandler } from '../../sonification/handler/DataHandler'
import { DatumOutput } from '../../sonification/output/DatumOutput'

import { NoteHandler } from '../../sonification/handler/NoteHandler'

import { FilterRangeHandler } from '../../sonification/handler/FilterRangeHandler'
import { RunningExtremaHandler } from '../../sonification/handler/RunningExtremaHandler'
import { SlopeParityHandler } from '../../sonification/handler/SlopeParityHandler'
import { SimpleDataHandler } from '../../sonification/handler/SimpleDataHandler'
import { CopyToClipboardHandler } from '../../sonification/handler/CopyToClipboardHandler'

import { DataOutputWrapper } from './DataHandlerInterfaces'
import { AVAILABLE_DATA_OUTPUT_TEMPLATES } from './DataOutputTemplates'
import { ParameterWrapper } from '../templates/ParameterInterface'

export interface DataHandlerWrapper {
    name: string
    id: string
    description: string
    dataOutputs: DataOutputWrapper[]
    handlerObject?: DataHandler
    createHandler: (domain: [number, number]) => DataHandler
    unsubscribe?: () => void
    parameters?: ParameterWrapper[]
}

export const initializeDataOutput = (output: DataOutputWrapper): DataOutputWrapper => {
    return { ...output, outputObject: output.createOutput() }
}

export const AVAILABLE_DATA_HANDLER_TEMPLATES: DataHandlerWrapper[] = [
    {
        name: 'Note Handler',
        id: `Note Handler-${Math.floor(Math.random() * Date.now())}`,
        description: 'Converts data to an audible note range.',
        dataOutputs: [initializeDataOutput(AVAILABLE_DATA_OUTPUT_TEMPLATES.note)],
        createHandler: (domain: [number, number]) => new NoteHandler(domain),
    },
    {
        name: 'Filter Range Handler',
        id: `Filter Range Handler-${Math.floor(Math.random() * Date.now())}`,
        description: "Filters data within the provided range. If within range, sent to this handler's outputs.",
        dataOutputs: [
            initializeDataOutput(AVAILABLE_DATA_OUTPUT_TEMPLATES.noise),
            AVAILABLE_DATA_OUTPUT_TEMPLATES.earcon,
        ],
        createHandler: (domain: [number, number]) =>
            new FilterRangeHandler([
                (domain[1] - domain[0]) * 0.4 + domain[0],
                (domain[1] - domain[0]) * 0.6 + domain[0],
            ]),
        parameters: [
            {
                name: 'Min',
                type: 'number',
                default: (obj?: DataHandler | DatumOutput) => {
                    if (obj) {
                        const frh = obj as FilterRangeHandler
                        return frh.domain[0]
                    } else {
                        return 0.4
                    }
                },
                handleUpdate: (value: number, obj?: DataHandler | DatumOutput) => {
                    if (obj) {
                        const frh = obj as FilterRangeHandler
                        frh.domain = [value, frh.domain[1]]
                    }
                },
            },
            {
                name: 'Max',
                type: 'number',
                default: (obj?: DataHandler | DatumOutput) => {
                    if (obj) {
                        const frh = obj as FilterRangeHandler
                        return frh.domain[1]
                    } else {
                        return 0.6
                    }
                },
                handleUpdate: (value: number, obj?: DataHandler | DatumOutput) => {
                    if (obj) {
                        const frh = obj as FilterRangeHandler
                        frh.domain = [frh.domain[0], value]
                    }
                },
            },
        ],
    },
    {
        name: 'Extrema Handler',
        id: `Extrema Handler-${Math.floor(Math.random() * Date.now())}`,
        description: 'Finds the new extrema value (maximum and/or minimum) in the data stream.',
        dataOutputs: [
            AVAILABLE_DATA_OUTPUT_TEMPLATES.earcon,
            initializeDataOutput(AVAILABLE_DATA_OUTPUT_TEMPLATES.speech),
        ],
        createHandler: (domain: [number, number]) => new RunningExtremaHandler(),
        parameters: [
            {
                name: 'Extrema to Find',
                type: 'list',
                default: (obj?: DataHandler | DatumOutput) => 0,
                values: [
                    { display: 'Maximum and Minimum', value: 0 },
                    { display: 'Maximum Only', value: 1 },
                    { display: 'Minimum Only', value: -1 },
                ],
                handleUpdate: (value: number, obj?: DataHandler | DatumOutput) => {
                    if (obj) {
                        const reh = obj as RunningExtremaHandler
                        reh.direction = value
                    }
                },
            },
        ],
    },
    // { name: 'Outlier Detection Handler', description: 'Description of outlier detection handler' },
    // { name: 'Slope Handler', description: 'Description of slope handler', createHandler: () => new Slope() },
    {
        name: 'Slope Change Handler',
        id: `Slope Change Handler-${Math.floor(Math.random() * Date.now())}`,
        description:
            'Finds direction of slope changes in the data stream. When the data goes from increasing to decreasing, and vise-versa.',
        dataOutputs: [
            AVAILABLE_DATA_OUTPUT_TEMPLATES.earcon,
            initializeDataOutput(AVAILABLE_DATA_OUTPUT_TEMPLATES.speech),
        ],
        createHandler: (domain: [number, number]) => new SlopeParityHandler(),
        parameters: [
            {
                name: 'Direction to Find',
                type: 'list',
                default: (obj?: DataHandler | DatumOutput) => 0,
                values: [
                    { display: 'Postive and Negative', value: 0 },
                    { display: 'Positive Only', value: 1 },
                    { display: 'Negative Only', value: -1 },
                ],
                handleUpdate: (value: number, obj?: DataHandler | DatumOutput) => {
                    if (obj) {
                        const sph = obj as SlopeParityHandler
                        sph.direction = value
                    }
                },
            },
        ],
    },

    {
        name: 'Simple Handler',
        id: `Simple Handler-${Math.floor(Math.random() * Date.now())}`,
        description: 'Outputs the raw data stream without processing.',
        dataOutputs: [initializeDataOutput(AVAILABLE_DATA_OUTPUT_TEMPLATES.speech)],
        createHandler: (domain: [number, number]) => new SimpleDataHandler(),
    },
    {
        name: 'Copy Handler',
        id: `Copy Handler-${Math.floor(Math.random() * Date.now())}`,
        description: 'Copies the data of the chosen sensor',
        dataOutputs: [],
        createHandler: (domain: [number, number]) => new CopyToClipboardHandler(),
    },
]
