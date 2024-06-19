import * as React from "react";
import {useNavigate, useParams} from "react-router-dom";
import axios from "axios";
import Typography from "@mui/material/Typography";
import {
    Dialog,
    DialogTitle,
    List,
    ListItem,
    ListItemAvatar,
    ListItemButton,
    ListItemText, Pagination,
    Paper,
    Stack
} from "@mui/material";
import Divider from '@mui/material/Divider';
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import PetitionCardList from "./PetitionCardList";
import Grid from "@mui/material/Grid";
import {useUserStore} from "../store";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from '@mui/icons-material/Add';
import SentimentVeryDissatisfiedIcon from "@mui/icons-material/SentimentVeryDissatisfied";

export default function MyPetitionsPage() {
    const navigate = useNavigate();
    const [categories, setCategories] = React.useState<Array<Category>>([]);
    const [ownedPetitions, setOwnedPetitions] = React.useState<Array<Petition>>([]);
    const [supportedPetitions, setSupportedPetitions] = React.useState<Array<Petition>>([]);
    const userState = useUserStore();

    React.useEffect(() => {
        if (!userState.token) {
            navigate('/login');
        }
        getCategories();
        getOwnedPetitions();
        getSupportedPetitions();
    }, []);

    const handleClickCreate = () => {
        navigate('/petitions/create');
    };

    const handleClickExplore = () => {
        navigate('/');
    };

    const getCategories = () => {
        axios.get('https://seng365.csse.canterbury.ac.nz/api/v1/petitions/categories')
            .then((response) => {
                setCategories(response.data);
            })
            .catch((error) => {
                console.log(error)
            });
    };

    const getOwnedPetitions = () => {
        if (userState.id) {
            const params: PetitionSearchParams = {};
            params.ownerId = parseInt(userState.id, 10);
            axios.get('https://seng365.csse.canterbury.ac.nz/api/v1/petitions', { params })
                .then((response) => {
                    setOwnedPetitions(response.data.petitions);
                })
                .catch((error) => {
                    console.log(error);
                });
        }
    };

    const getSupportedPetitions = () => {
        if (userState.id) {
            const params: PetitionSearchParams = {};
            params.supporterId = parseInt(userState.id, 10);
            axios.get('https://seng365.csse.canterbury.ac.nz/api/v1/petitions', { params })
                .then((response) => {
                    setSupportedPetitions(response.data.petitions);
                })
                .catch((error) => {
                    console.log(error);
                });
        }
    };

    return (
        <Container disableGutters maxWidth={'xl'}>
            <Grid container spacing={2} p={2}>
                <Grid item xs={12} sm={8}>
                    <Typography variant='h5' component='div' sx={{textAlign: {xs: 'center', sm: 'start'}}}>
                        My Petitions
                    </Typography>
                </Grid>
                <Grid item xs={12} sm={4} sx={{display: 'flex', justifyContent: {xs: 'center', sm: 'end'}}}>
                    <Button variant="contained" onClick={handleClickCreate} sx={{fontSize: 'large'}} >
                        <AddIcon/>
                        CREATE
                    </Button>
                </Grid>

                <Grid item xs={12}>
                    <PetitionCardList petitions={ownedPetitions} categories={categories} cardsPerPage={4} noneFoundComponent={
                        <Stack alignItems={"center"} >
                            <Typography>You don't own any petitions right now. Click the CREATE button to start a new petition!</Typography>
                        </Stack>
                    }/>
                </Grid>
                <Grid item xs={12} sm={8}>
                    <Typography variant='h5' component='div' sx={{textAlign: {xs: 'center', sm: 'start'}}}>
                        Supported Petitions
                    </Typography>
                </Grid>
                <Grid item xs={12} sm={4} sx={{display: 'flex', justifyContent: {xs: 'center', sm: 'end'}}}>

                </Grid>
                <Grid item xs={12}>
                    <PetitionCardList petitions={supportedPetitions} categories={categories} cardsPerPage={4} noneFoundComponent={
                        <Stack alignItems={"center"} >
                            <Typography>You aren't supporting any petitions yet...</Typography>
                            <Button onClick={handleClickExplore} sx={{fontSize: 'large'}} >
                                <SearchIcon/>
                                Find petitions
                            </Button>
                        </Stack>
                    }/>
                </Grid>
            </Grid>
        </Container>
    );
}