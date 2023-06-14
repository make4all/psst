import { DataHandler } from '../../sonification/handler/DataHandler'
import { DatumOutput } from '../../sonification/output/DatumOutput'
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

export interface DataOutputWrapper {
    name: string
    id: string
    createOutput: () => DatumOutput
    outputObject?: DatumOutput
    parameters?: ParameterWrapper[]
}
