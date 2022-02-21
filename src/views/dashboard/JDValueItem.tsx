import { Button, Card, CardContent, CardHeader, Grid, Typography } from '@mui/material'

import DataHandlerItem from './DataHandlerItem'

export interface JDValueItemProps {
    name: string
    currentValue: number
    dataHandlers: any[]
}

export default function JDValueItem(props: React.Attributes & JDValueItemProps): JSX.Element {
    const handlersExist = props.dataHandlers.length !== 0

    return (
        <Grid item xs={12} sm={handlersExist ? 12 : 6} md={handlersExist ? 12 : 4}>
            <Card>
                <CardHeader
                    title={
                        <Typography variant="subtitle1" component="span">
                            {props.name}
                        </Typography>
                    }
                    subheader={
                        <Typography variant="h5" component="span">
                            {props.currentValue}
                        </Typography>
                    }
                    action={<Button variant="contained">Add Handler</Button>}
                />
                {props.dataHandlers.length === 0 ? undefined : (
                    <CardContent>
                        <Grid container spacing={1}>
                            {props.dataHandlers.map((dataHandler) => (
                                <DataHandlerItem {...dataHandler} />
                            ))}
                        </Grid>
                    </CardContent>
                )}
            </Card>
        </Grid>
    )
}
