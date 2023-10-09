import { DataHandler } from '../../sonification/handler/DataHandler'
import { DatumOutput } from '../../sonification/output/DatumOutput'

import { NoteSonify } from '../../sonification/output/NoteSonify'
import { NoiseSonify } from '../../sonification/output/NoiseSonify'
import { Speech } from '../../sonification/output/Speech'
import { FileOutput } from '../../sonification/output/FileOutput'

export const AVAILABLE_DATA_OUTPUT_TEMPLATES = {
    note: {
        name: 'Note',
        id: `Note-${Math.floor(Math.random() * Date.now())}`,
        createOutput: () => new NoteSonify(),
        parameters: [
            {
                name: 'Stereo Pan',
                type: 'list',
                default: (obj?: DataHandler | DatumOutput) => 0,
                values: [
                    { display: 'Both', value: 0 },
                    { display: 'Left', value: -1 },
                    { display: 'Right', value: 1 },
                ],
                handleUpdate: (value: number, obj?: DataHandler | DatumOutput) => {
                    if (obj) {
                        const ns = obj as NoteSonify
                        ns.stereoPannerNode.pan.value = value
                    }
                },
            },
        ],
    },
    noise: {
        name: 'White Noise',
        id: `White Noise-${Math.floor(Math.random() * Date.now())}`,
        createOutput: () => new NoiseSonify(),
    },
    earcon: {
        name: 'Earcon',
        id: `Earcon-${Math.floor(Math.random() * Date.now())}`,
        createOutput: () => {
            const fo = new FileOutput()
            // Use long beep as the default
            fetch(`./assets/shortbeep.wav`)
                .then((res) => res.arrayBuffer())
                .then((buffer: ArrayBuffer) => {
                    fo.buffer = buffer
                })
            return fo
        },
        parameters: [
            {
                name: 'Earcon to Play',
                type: 'list',
                default: (obj?: DataHandler | DatumOutput) => 0,
                values: [
                    { display: 'Short Beep', value: 0 },
                    { display: 'Long Beep', value: 1 },
                    { display: 'Bell', value: 2 },
                    { display: 'Whistle Up', value: 3 },
                    { display: 'Whistle Down', value: 4 },
                ],
                handleUpdate: (value: number, obj?: DataHandler | DatumOutput) => {
                    if (obj) {
                        const file_list = [
                            'shortbeep.wav',
                            'beep.wav',
                            'bell.mp3',
                            'whistle%20up.wav',
                            'whistle%20down.wav',
                        ]
                        const fo = obj as FileOutput
                        fetch(`./assets/${file_list[value]}`)
                            .then((res) => res.arrayBuffer())
                            .then((buffer: ArrayBuffer) => {
                                fo.buffer = buffer
                            })
                    }
                },
            },
        ],
    },
    speech: {
        name: 'Speech',
        id: `Speech-${Math.floor(Math.random() * Date.now())}`,
        createOutput: () => new Speech(),
        parameters: [
            {
                name: 'Interrupt when new point arrives?',
                type: 'list',
                default: (obj?: DataHandler | DatumOutput) => 0,
                values: [
                    { display: 'Yes', value: 0 },
                    { display: 'No', value: 1 },
                ],
                handleUpdate: (value: number, obj?: DataHandler | DatumOutput) => {
                    if (obj) {
                        const sp = obj as Speech
                        sp.polite = value == 1 ? true : false
                    }
                },
            },
        ],
    },
}
