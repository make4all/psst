import React from 'react';

import { DataGrid } from '@mui/x-data-grid';
import { DataManager } from '../DataManager';

export interface DataViewState {
    columns: any[],
    rows: any[]
};

export interface DataViewProps {
    
};

export class DataView extends React.Component<DataViewProps, DataViewState> {
    constructor(props: DataViewProps) {
        super(props);
        this.state = {
            rows: [],
            columns: []
        };

        DataManager.getInstance().addListener(this.handleDataUpdate)
    }

    public render() {
        const { rows, columns } = this.state;
        const loaded = rows && columns;
        console.log(columns);

        return (
            <div style={{ height: 500, width: '100%' }} aria-live="polite">
                {
                    loaded && 
                    <DataGrid
                        rows={rows}
                        columns={columns}
                        pageSize={10}
                        rowsPerPageOptions={[10, 25, 50, 100]}
                        />
                }
                
            </div>
        );
    }

    public handleDataUpdate = (table: any): void => {
        const columns = table.columnNames().map(c => ({ field: c, headerName: c, width: 160, renderHeader: (params: any) => (
            <strong>{c}</strong>
          ), }));
        const rows = table.objects().map((o, i) => (Object.assign({id: i}, o)));

        this.setState({ columns, rows });
    }
}