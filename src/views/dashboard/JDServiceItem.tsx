import { Card, CardContent, CardHeader, Grid, Typography } from '@mui/material'

import { blueGrey } from '@mui/material/colors'
import { DataHandlerWrapper, JDValueWrapper } from '../../pages/Dashboard'
import JDValueItem from './JDValueItem'

export interface JDServiceItemProps {
    name: string
    values: JDValueWrapper[]
    currentHandlerTemplates: DataHandlerWrapper[]
    onDataHandlerChange?: (add: boolean, serviceName: string, valueName: string, template: DataHandlerWrapper) => void
    onParameterChange?: () => void
    // onRemoveDataHandler?: (serviceName: string, valueName: string, handlerName: string) => void
}

export default function JDServiceItem(props: React.Attributes & JDServiceItemProps): JSX.Element {
    const { onDataHandlerChange, onParameterChange } = props

    return (
        <Grid item xs={12}>
            <Card
                sx={{
                    border: '2px solid',
                    borderColor: blueGrey[50],
                    backgroundColor: blueGrey[50],
                    boxShadow: 'none',
                }}
            >
                <CardHeader
                    sx={{ backgroundColor: '#fff' }}
                    title={
                        <Typography variant="subtitle1" component="span" sx={{ fontSize: '1.25rem', color: '#122740' }}>
                            {props.name}
                        </Typography>
                    }
                />
                <CardContent>
                    <Grid container spacing={2}>
                        {props.values.map((value, index) => (
                            <JDValueItem
                                {...value}
                                key={value.name + index}
                                currentHandlerTemplates={props.currentHandlerTemplates}
                                onDataHandlerChange={(add: boolean, template: DataHandlerWrapper) => {
                                    onDataHandlerChange?.(add, props.name, value.name, template)
                                }}
                                onParameterChange={onParameterChange}
                            />
                        ))}
                    </Grid>
                </CardContent>
            </Card>
        </Grid>
    )
}
