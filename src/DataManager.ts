import * as aq from 'arquero'

export type DataListener = (table: any) => void
export class DataManager {
    private static instance: DataManager

    private constructor() {}

    public static getInstance(): DataManager {
        if (!DataManager.instance) {
            DataManager.instance = new DataManager()
        }
        return DataManager.instance
    }

    private _listeners: DataListener[] = []
    public table: any

    public loadDataFromUrl(url: string) {
        // Check for empty strings
        // TODO check for valid url formats, or try to clean up incomplete urls - e.g. add https://
        if (!url || url.trim() === '') {
            console.log('Invalid url provided for data. Could not load.')
            return
        }

        // TODO Handle error responses
        fetch(url).then((res) => res.text().then((text) => DataManager.instance.loadDataFromText(text)))
    }

    public loadDataFromText(text: string) {
        // Check for empty strings, bad data, anything else?
        if (!text || text.trim() === '') {
            console.log('Invalid text provided for data. Could not load.')
            return
        }

        // Determine if the input text is tab or comma separated values
        // Compute the number of tabs and lines
        let tabNum = 0,
            lineNum = 0
        for (let i = 0; i < text.length; i++) {
            if (text.charAt(i) === '\t') tabNum++
            if (text.charAt(i) === '\n') lineNum++
        }

        // If one or more tab per line, then it is tab separated values
        let isTabSeparated = tabNum / lineNum >= 1
        let delimiter = isTabSeparated ? '\t' : ','

        // TODO: Determine if the input has headers, for now check if only one line of data
        let header = lineNum > 0
        console.log(header, tabNum, lineNum)

        this.table = aq.fromCSV(text, { delimiter, header })
        console.log(this.table.columns())
        console.log(this.table)
        this.handleDataChange()
    }

    public loadDataFromFile(file: File) {
        file.text().then((text) => DataManager.instance.loadDataFromText(text))
    }

    public handleDataChange() {
        for (let i = 0; i < this._listeners.length; i++) {
            this._listeners[i](this.table)
        }
    }

    public addListener(listener: DataListener) {
        this._listeners.push(listener)
    }

    public removeListener(listener: DataListener) {
        for (let i = 0; i < this._listeners.length; i++) {
            if (listener === this._listeners[i]) {
                this._listeners.splice(i, 1)
            }
        }
    }
}
