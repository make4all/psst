import React, { ChangeEvent } from 'react';

import { Button, Box, Grid, Input, Stack, TextareaAutosize, ToggleButtonGroup, ToggleButton, Typography, TextField, FormControl, InputLabel, FormHelperText, Select, SelectChangeEvent, MenuItem, NativeSelect } from '@mui/material';
import { ContentPaste, UploadFile, Link, ListAlt } from '@mui/icons-material';

import { DataManager } from '../DataManager';

const EXAMPLE_LIST = [
    {fileName: 'sawtooth_wave.csv', displayName: 'Sawtooth Wave'},
    {fileName: 'sine_wave.csv', displayName: 'Sine Wave'},
    {fileName: 'square_wave.csv', displayName: 'Square Wave'},
];

export interface ImportViewState {
    importType: string;
    exampleValue: string;
};

export interface ImportViewProps {
    
};

export class ImportView extends React.Component<ImportViewProps, ImportViewState> {
    private _selectExample: React.RefObject<HTMLDivElement>;
    private _textArea : React.RefObject<HTMLTextAreaElement>;
    private _inputFile: React.RefObject<HTMLInputElement>;
    private _textField: React.RefObject<HTMLDivElement>;
    
    constructor(props: ImportViewProps) {
        super(props);
        this.state = {
            importType: 'example',
            exampleValue: EXAMPLE_LIST[0].fileName,
        };

        this._selectExample = React.createRef();
        this._textArea = React.createRef();
        this._inputFile = React.createRef();
        this._textField = React.createRef();
    }

    public render() {
        let { importType, exampleValue } = this.state;

        let inputElement, headerText, bodyText;

        let continueButton: any = (
            <Button
                variant="contained"
                sx={{ mt: 1, mr: 1 }}
                onClick={this._handleClickContinue} >
                    Continue
            </Button>
        );

        switch (importType) {
            case "example":
                inputElement = (
                    <FormControl>
                        <InputLabel variant="standard" htmlFor="example-data-select" id="example-data-label">Example Data</InputLabel>
                        <NativeSelect
                            ref={ this._selectExample }
                            aria-label="Choose example data"
                            id="example-data-select"
                            placeholder="Enter data here"
                            value={ exampleValue }
                            variant="standard"
                            onChange={ this._handleExampleChange }
                            >
                            {EXAMPLE_LIST.map( e => (<option value={ e.fileName } key={ e.fileName }>{ e.displayName }</option>))}
                        </NativeSelect>
                    </FormControl>
                );
                headerText = 'Choose from example data';
                bodyText = 'Choose an example data file from the provided list.';
                continueButton = undefined;
                break;
            case "paste":
                inputElement = (
                    <TextareaAutosize
                        ref={ this._textArea }
                        aria-label="Textarea for data entry"
                        placeholder="Enter data here"
                        style={{ width: '100%', maxHeight: '400px', overflow: 'scroll' }}
                        minRows={5}
                        />
                );
                headerText = 'Copy & paste your data';
                bodyText = 'Select your table from a spreadsheet and paste it in the text field. We support comma/tab separated values (i.e., CSV, TSV).'
                break;
            case "file":
                inputElement = (
                    <label htmlFor="input-upload-file" aria-label="Choose file">
                        <Box component="div" sx={{ p: 2, border: '2px dashed #aaa' }}>
                            <Button component="label">
                                Upload
                                <Input
                                    style={{ display: 'none' }}
                                    aria-hidden={true}
                                    ref={ this._inputFile }
                                    type="file"
                                    id="input-upload-file"
                                    onChange={ this._handleFileChange }
                                    />   
                            </Button>
                        </Box>
                    </label>
                );
                headerText = 'Upload your data file';
                bodyText = 'Choose your local data file (*.csv or *.tsv) to upload.';
                continueButton = undefined;
                break;
            case "link":
                inputElement = (
                    <TextField
                        ref={this._textField}
                        id="my-input"
                        aria-label="Text field for data url"
                        label="Data URL"
                        />
                );
                headerText = 'Link to your external data';
                bodyText = 'Enter a valid url to an external data file. We support comma/tab separated values (i.e., CSV, TSV).';
                break;
        }

        return (
            <div>
                <h2>How do you want to upload your data?</h2>
                <div>
                    <Grid container spacing={2}>
                        <Grid item xs={4} sm={3} md={2}>
                            <ToggleButtonGroup orientation="vertical" value={importType} onChange={this._handleImportTypeChange} exclusive>
                                <ToggleButton value="example">
                                    <ListAlt />
                                    <span style={{ 'textTransform': 'none', 'marginLeft': '0.5rem', 'textAlign': 'left', 'maxWidth': '100px', 'lineHeight': '1.4' }} >Choose from example data</span>
                                </ToggleButton>
                                <ToggleButton value="paste">
                                    <ContentPaste />
                                    <span style={{ 'textTransform': 'none', 'marginLeft': '0.5rem', 'textAlign': 'left', 'maxWidth': '100px', 'lineHeight': '1.4' }} >Copy & paste data table</span>
                                </ToggleButton>
                                <ToggleButton value="file">
                                    <UploadFile />
                                    <span style={{ 'textTransform': 'none', 'marginLeft': '0.5rem', 'textAlign': 'left', 'maxWidth': '100px', 'lineHeight': '1.4' }} >Upload CSV or TSV file</span>
                                </ToggleButton>
                                <ToggleButton value="link">
                                    <Link />
                                    <span style={{ 'textTransform': 'none', 'marginLeft': '0.5rem', 'textAlign': 'left', 'maxWidth': '100px', 'lineHeight': '1.4' }} >Link to external url</span>
                                </ToggleButton>
                            </ToggleButtonGroup>
                        </Grid>
                        <Grid item xs={8} sm={9} md={8}>
                            <div>
                                <Stack spacing={1}>
                                    <Typography variant="h6" color="text.secondary">
                                        { headerText }
                                    </Typography>
                                    { inputElement }
                                    <Typography variant="body2">
                                        { bodyText }
                                    </Typography>
                                    { continueButton }
                                </Stack>
                                
                            </div>
                            
                        </Grid>
                        <Grid item xs={0} sm={0} md={2}>
                        </Grid>
                    </Grid>

                </div>
            </div>
        );
    }

    private _handleClickContinue = (event: React.MouseEvent<HTMLElement>) => {
        switch(this.state.importType) {
            case "example":
            case "file":
                    break;
            case "paste":
                if (this._textArea && this._textArea.current) {
                    let text = this._textArea.current.value.trim();
                    DataManager.getInstance().loadDataFromText(text);
                }
                break;
            case "link":
                if (this._textField && this._textField.current) {
                    let input = this._textField.current.querySelector('input');
                    if (input && input.value) {
                        let url = input.value.trim();
                        DataManager.getInstance().loadDataFromUrl(url);
                    }
                }
                break;
        }
        
    }

    // https://raw.githubusercontent.com/vega/vega-datasets/next/data/stocks.csv

    private _handleFileChange = (event: React.FormEvent<HTMLElement>) => {
        let target: any = event.target;
        if (target && target.files && target.files.length === 1) {
            console.log(event);
            let file: File = target.files[0];
            DataManager.getInstance().loadDataFromFile(file);
        }
    }

    private _handleExampleChange = (event: ChangeEvent<HTMLSelectElement>) => {
        let exampleValue = event.target.value;
        this.setState({ exampleValue });
        let url = `./data/${exampleValue}`
        DataManager.getInstance().loadDataFromUrl(url);
    }

    private _handleImportTypeChange = (event: React.MouseEvent<HTMLElement>, importType: string) => {
        // Only change import type if another one has been selected, otherwise keep the same
        if (importType) {
            this.setState({ importType });
        }
    }
}

