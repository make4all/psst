import { Button, Card, CardContent, CardHeader, Grid, Typography } from '@mui/material'

import { grey } from '@mui/material/colors'
import { NoiseSonify } from '../../sonification/output/NoiseSonify'
import { NoteSonify } from '../../sonification/output/NoteSonify'
import { SonifyFixedDuration } from '../../sonification/output/SonifyFixedDuration'
import { Speech } from '../../sonification/output/Speech'
import DataOutputList from './DataOutputList'

export interface DataHandlerItemProps {
    name: string
    description: string
    active: boolean
}

export default function DataHandlerItem(props: React.Attributes & DataHandlerItemProps): JSX.Element {
    const dataOutputList = [
        { name: 'Note', class: NoteSonify },
        { name: 'White Noise', class: NoiseSonify },
        { name: 'Earcon', class: SonifyFixedDuration },
        { name: 'Speech', class: Speech },
    ]

    const { active } = props

    return (
        <Grid item md={6} sm={12} xs={12}>
            <Card
                elevation={active ? 0 : 1}
                sx={{
                    border: '2px solid',
                    borderColor: grey[200],
                }}
            >
                <CardHeader
                    sx={{ bgcolor: grey[200] }}
                    title={
                        <Typography variant="subtitle1" component="span">
                            {props.name}
                        </Typography>
                    }
                    action={<Button variant="outlined">{active ? 'Remove' : 'Add'}</Button>}
                />
                <CardContent sx={{ minHeight: 140 }}>
                    <Grid container spacing={1}>
                        <Grid item xs={6}>
                            <Typography variant="body2">{props.description}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <DataOutputList dataOutputs={dataOutputList} />
                            {/* <Box sx={{mx: 4}}></Box> */}
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </Grid>
    )
}
