import { Card, CardContent, CardHeader, Grid, Typography } from '@mui/material'

import { blueGrey } from '@mui/material/colors'
import JDValueItem from './JDValueItem'

export interface JDServiceItemProps {
    name: string
    values: any[]
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
                        {props.values.map((value) => (
                            <JDValueItem {...value}  />
                        ))}
                    </Grid>
                </CardContent>
            </Card>
        </Grid>
    )
}
