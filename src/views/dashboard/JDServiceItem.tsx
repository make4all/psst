import { Card, CardContent, CardHeader, Grid, Typography } from '@mui/material'

import { blueGrey } from '@mui/material/colors'
import { DataHandlerWrapper, JDValueWrapper } from '../../pages/Dashboard'
import JDValueItem from './JDValueItem'

export interface JDServiceItemProps {
    name: string
    id: string
    values: JDValueWrapper[]
    currentHandlerTemplates: DataHandlerWrapper[]
    onDataHandlerChange?: (add: boolean, serviceId: string, valueId: string, template: DataHandlerWrapper) => void
    onParameterChange?: () => void
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
                        <Typography variant="subtitle1" component="h4" sx={{ fontSize: '1.25rem', color: '#122740' }}>
                            {props.name}
                        </Typography>
                    }
                />
                <CardContent>
                    <Grid container spacing={2}>
                        {props.values.map((value, index) => (
                            <JDValueItem
                                {...value}
                                key={value.id}
                                currentHandlerTemplates={props.currentHandlerTemplates}
                                onDataHandlerChange={(add: boolean, template: DataHandlerWrapper) => {
                                    onDataHandlerChange?.(add, props.id, value.id, template)
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
