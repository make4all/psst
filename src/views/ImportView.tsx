import React from 'react';

import { Button, Card, CardContent, Chip, Grid, Input, Stack, TextareaAutosize, ToggleButtonGroup, ToggleButton, Typography } from '@mui/material';
import { ContentPaste, UploadFile, Link } from '@mui/icons-material';

import DataManager from '../DataManager';

export interface ImportViewState {
    importType: string;
};

export interface ImportViewProps {
    
};

export class ImportView extends React.Component<ImportViewProps, ImportViewState> {
    private _textArea : React.RefObject<HTMLTextAreaElement>;

    constructor(props: ImportViewProps) {
        super(props);
        this.state = {
            importType: 'paste',
        };

        this._textArea = React.createRef();
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
                            <label htmlFor="button-upload-csv-xls">
                                <Input id="button-upload-csv-xls" type="file" style={{ 'display': 'none' }} />
                            </label>
                                <UploadFile /> <span style={{ 'textTransform': 'none', 'marginLeft': '0.5rem', 'textAlign': 'left', 'maxWidth': '100px', 'lineHeight': '1.4' }} >Upload CSV or Excel file</span>
                            </ToggleButton>
                            <ToggleButton value="link">
                                <Link /> <span style={{ 'textTransform': 'none', 'marginLeft': '0.5rem', 'textAlign': 'left', 'maxWidth': '100px', 'lineHeight': '1.4' }} >Link to external url</span>
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
                        ref={this._textArea}
                        aria-label="data entry textarea"
                        placeholder="Enter data here"
                        style={{ width: '100%', maxHeight: '400px', overflow: 'scroll' }}
                        minRows={5}
                        />
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
        if (this._textArea && this._textArea.current) {
            let text = this._textArea.current.value;
            DataManager.getInstance().loadDataFromText(text);
        }
    }

    private _handleImportTypeChange = (event: React.MouseEvent<HTMLElement>, importType: string) => {
        this.setState({ importType });
    }
}

