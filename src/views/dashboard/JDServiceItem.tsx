import { Box, Button, Card, CardContent, CardHeader, Grid, Paper, Typography } from '@mui/material'

import { grey, blueGrey } from '@mui/material/colors'
import { NoiseSonify } from '../../sonification/output/NoiseSonify'
import { NoteSonify } from '../../sonification/output/NoteSonify'
import { SonifyFixedDuration } from '../../sonification/output/SonifyFixedDuration'
import { Speech } from '../../sonification/output/Speech'
import DataOutputList from './DataOutputList'

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
                <CardContent sx={{ minHeight: 140 }}>
                    <Grid container spacing={1}></Grid>
                </CardContent>
            </Card>
        </Grid>
    )
}
