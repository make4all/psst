import JDServiceItem from '../../views/dashboard/JDServiceItem'
import { JDRegister, JDService } from 'jacdac-ts'
import { DataHandlerWrapper } from './DataHandlerInterfaces'

export interface JDServiceWrapper {
    name: string
    id: string
    serviceObject?: JDService
    values: JDValueWrapper[]
}

export interface JDValueWrapper {
    name: string
    id: string
    index: number
    sinkId: number
    domain: [number, number]
    units: string
    format: (value: number) => string
    register: JDRegister
    dataHandlers: DataHandlerWrapper[]
    unsubscribe?: () => void
}
