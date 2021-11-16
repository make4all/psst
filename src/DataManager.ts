import * as aq from 'arquero';

export default class DataManager {
    private static instance: DataManager;

    private constructor() {}

    public static getInstance(): DataManager {
        if (!DataManager.instance) {
            DataManager.instance = new DataManager();
        }
        return DataManager.instance;
    }

    public dataTable: any;

    public loadDataFromUrl() {

    }

    public loadDataFromText(text: string) {
        // Check for empty strings, bad data, anything else?
        if (!text || text.trim() === "") {
            console.log("Invalid text provided for data. Could not load.");
            return;
        }

        // Determine if the input text is tab or comma separated values
        // Compute the number of tabs and lines
        let tabNum = 0, lineNum = 0;
        for(let i = 0; i < text.length; i++) {
            if (text.charAt(i) === "\t") tabNum++;
            if (text.charAt(i) === "\n") lineNum++;
        }

        // If one or more tab per line, then it is tab separated values
        let isTabSeparated = ( tabNum / lineNum ) >= 1;
        let delimiter = isTabSeparated ? "\t" : ",";

        // TODO: Determine if the input has headers, for now check if only one line of data
        let header = lineNum > 0;
        console.log(header, tabNum, lineNum);

        let dataTable = aq.fromCSV(text, { delimiter, header });
        console.log(dataTable);
    }

    public loadDataFromFile(file: File) {
        file.text().then(text => DataManager.instance.loadDataFromText(text));
    }


}