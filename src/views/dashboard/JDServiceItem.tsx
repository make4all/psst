import { Card, CardContent, CardHeader, Grid, Typography } from '@mui/material'

import { blueGrey } from '@mui/material/colors'
import { DataHandlerTemplate, JDValueWrapper } from '../../pages/Dashboard'
import JDValueItem from './JDValueItem'

export interface JDServiceItemProps {
    name: string
    values: JDValueWrapper[]
    currentHandlerTemplates: DataHandlerTemplate[]
    onAddDataHandler?: (serviceName: string, valueName: string, template: DataHandlerTemplate) => void
    onRemoveDataHandler?: (serviceName: string, valueName: string, handlerName: string) => void
}

export default function JDServiceItem(props: React.Attributes & JDServiceItemProps): JSX.Element {
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
                        {props.values.map((value, valueIndex) => (
                            <JDValueItem
                                {...value}
                                key={valueIndex}
                                currentHandlerTemplates={props.currentHandlerTemplates}
                                onAddDataHandler={(template: DataHandlerTemplate) => {
                                    if (props.onAddDataHandler) {
                                        props.onAddDataHandler(props.name, value.name, template)
                                    }
                                }}
                                onRemoveDataHandler={(handlerName: string) => {
                                    if (props.onRemoveDataHandler) {
                                        props.onRemoveDataHandler(props.name, value.name, handlerName)
                                    }
                                }}
                            />
                        ))}
                    </Grid>
                </CardContent>
            </Card>
        </Grid>
    )
}
