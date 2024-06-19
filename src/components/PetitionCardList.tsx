import * as React from 'react';
import Grid from '@mui/material/Grid';
import PetitionCard from './PetitionCard';
import {Pagination, Paper, Stack} from "@mui/material";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import {ReactElement} from "react";

export default function PetitionCardList({petitions, categories, cardsPerPage, noneFoundComponent}:
{ petitions: Petition[], categories: Category[], cardsPerPage: number, noneFoundComponent?: ReactElement }) {
    const [page, setPage] = React.useState<number>(1);

    React.useEffect(() => {
        setPage(1);
    }, [petitions]);

    const handlePaginationChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
    };

    return (
        <Stack px={2} alignItems={"center"}>
            {petitions.length === 0 && (
                <div>
                    {noneFoundComponent ? (
                        noneFoundComponent
                    ) : (
                        <Stack alignItems={"center"} >
                            <SentimentVeryDissatisfiedIcon />
                            <Typography>No Petitions Found</Typography>
                        </Stack>
                    )}
                </div>
            )}

            {petitions.length > cardsPerPage && (
                <Pagination count={Math.ceil(petitions.length / cardsPerPage)} variant="outlined" shape={"rounded"} color="primary" page={page} showFirstButton showLastButton onChange={handlePaginationChange}/>
            )}

            <Grid container spacing={2} sx={{ alignItems: 'start', py: 2 }}>
            {petitions.slice(cardsPerPage*(page-1), cardsPerPage*page).map((petition, index) => (
                <Grid item xs={12} md={6} lg={3}>
                    <PetitionCard petition={petition} category={categories.find(c => c.categoryId === petition.categoryId)?.name} />
                </Grid>
            ))}
            </Grid>
        </Stack>
    );
};