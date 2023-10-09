import { DataHandler } from '../../sonification/handler/DataHandler'
import { DatumOutput } from '../../sonification/output/DatumOutput'

export interface ParameterWrapper {
    name: string
    type: string
    default?: (obj?: DataHandler | DatumOutput) => number
    values?: { display: string; value: number }[]
    handleUpdate: (value: number, obj?: DataHandler | DatumOutput) => void
}
