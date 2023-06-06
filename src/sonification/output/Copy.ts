import { Datum } from '../Datum'
import { getSonificationLoggingLevel, OutputStateChange, SonificationLoggingLevel } from '../OutputConstants'
import { DatumOutput } from './DatumOutput'
import { CopyToClipboardHandler } from '../handler/CopyToClipboardHandler'

const DEBUG = true

// Define the CopyToClipboardOutput class
export class Copy extends DatumOutput {
    private copyToClipboardHandler: CopyToClipboardHandler

    constructor(copyToClipboardHandler: CopyToClipboardHandler) {
        super()
        this.copyToClipboardHandler = copyToClipboardHandler
    }

    public copyToClipboard(data: Datum) {
        // Implement the copy to clipboard functionality using the provided data
    }

    public removeFromClipboard() {
        // Implement the remove from clipboard functionality
    }

    protected output(datum: Datum) {
        super.output(datum)
        this.copyToClipboard(datum) // Call the copyToClipboard method when outputting the datum
    }

    public toString(): string {
        return 'Copy'
    }
}
