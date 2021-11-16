import React from 'react';

import { Button, Card, CardContent, Chip, Grid, Input, Stack, TextareaAutosize, ToggleButtonGroup, ToggleButton, Typography, TextField, FormControl, InputLabel, FormHelperText } from '@mui/material';
import { ContentPaste, UploadFile, Link, BreakfastDiningOutlined } from '@mui/icons-material';

import DataManager from '../DataManager';

export interface ImportViewState {
    importType: string;
};

export interface ImportViewProps {
    
};

export class ImportView extends React.Component<ImportViewProps, ImportViewState> {
    private _textArea : React.RefObject<HTMLTextAreaElement>;
    private _inputFile: React.RefObject<HTMLInputElement>;
    private _textField: React.RefObject<HTMLDivElement>;

    constructor(props: ImportViewProps) {
        super(props);
        this.state = {
            importType: 'paste',
        };

        this._textArea = React.createRef();
        this._inputFile = React.createRef();
        this._textField = React.createRef();
    }

    public render() {
        let {importType} = this.state;
        return (
            <div>
                <h2>How do you want to upload your data?</h2>
                <div>
                <Grid container spacing={2}>
                    <Grid item sm={4} md={2}>
                        <ToggleButtonGroup orientation="vertical" value={importType} onChange={this._handleImportTypeChange} exclusive>
                            <ToggleButton value="paste">
                                <ContentPaste />
                                <span style={{ 'textTransform': 'none', 'marginLeft': '0.5rem', 'textAlign': 'left', 'maxWidth': '100px', 'lineHeight': '1.4' }} >Copy & paste data table</span>
                            </ToggleButton>
                            <ToggleButton value="file">
                                <UploadFile />
                                <span style={{ 'textTransform': 'none', 'marginLeft': '0.5rem', 'textAlign': 'left', 'maxWidth': '100px', 'lineHeight': '1.4' }} >Upload CSV or Excel file</span>
                            </ToggleButton>
                            <ToggleButton value="link">
                                <Link />
                                <span style={{ 'textTransform': 'none', 'marginLeft': '0.5rem', 'textAlign': 'left', 'maxWidth': '100px', 'lineHeight': '1.4' }} >Link to external url</span>
                            </ToggleButton>
                        </ToggleButtonGroup>
                    </Grid>
                    <Grid item sm={8} md={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" color="text.secondary">
                                    Copy & paste your data
                                </Typography>
                                <Typography variant="body2">
                                    Select your table from a spreadsheet and paste it in the text field. We support comma/tab separated values (i.e., CSV, TSV).
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item sm={12} md={6}>
                        <TextareaAutosize
                            ref={ this._textArea }
                            aria-label="data entry textarea"
                            placeholder="Enter data here"
                            style={{ width: '100%', maxHeight: '400px', overflow: 'scroll' }}
                            minRows={5}
                            />
                        <Input
                            ref={ this._inputFile }
                            type="file"
                            onChange={ this._handleFileChange }
                            />
                            <TextField ref={this._textField} id="my-input" label="Data URL"/>
                    </Grid>
                </Grid>
                <Button
                    variant="contained"
                    sx={{ mt: 1, mr: 1 }}
                    onClick={this._handleClickContinue} >
                        Continue
                </Button>
                </div>
            </div>
        );
    }

    private _handleClickContinue = (event: React.MouseEvent<HTMLElement>) => {
        switch(this.state.importType) {
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

    private _handleImportTypeChange = (event: React.MouseEvent<HTMLElement>, importType: string) => {
        this.setState({ importType });
    }
}

