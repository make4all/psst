import { Statistic } from './Statistic'

/**
 * A statistic that updates for each new datum
 */
export class StatObserver extends Statistic {
    constructor(value?: number) {
        super(value ? value : 0)
    }
    error!: (err: any) => void
    complete!: () => void
}
