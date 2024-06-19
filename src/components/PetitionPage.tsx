import * as React from "react";
import {useNavigate, useParams} from "react-router-dom";
import axios from "axios";
import Typography from "@mui/material/Typography";
import {
    Accordion, AccordionDetails, AccordionSummary, Chip, Dialog, DialogContent, DialogTitle,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Paper,
    Stack
} from "@mui/material";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PetitionCardList from "./PetitionCardList";
import Grid from "@mui/material/Grid";
import {useUserStore} from "../store";
import TextField from "@mui/material/TextField";
import EditIcon from "@mui/icons-material/Edit";
import InfoIcon from "@mui/icons-material/Info";
import DeleteIcon from "@mui/icons-material/Delete";
import ErrorIcon from "@mui/icons-material/Error";

export default function PetitionPage() {
    const {id} = useParams();
    const navigate = useNavigate();
    const userState = useUserStore();

    const [petition, setPetition] = React.useState<PetitionDetails | null>(null);
    const [categories, setCategories] = React.useState<Array<Category>>([]);
    const [supporters, setSupporters] = React.useState<Array<Supporter>>([]);
    const [ownersPetitions, setOwnersPetitions] = React.useState<Array<Petition>>([]);
    const [sameCategoryPetitions, setSameCategoryPetitions] = React.useState<Array<Petition>>([]);

    const [tierSelected, setTierSelected] = React.useState<SupportTier | null>(null);
    const [message, setMessage] = React.useState<string>("");
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState<boolean>(false);

    const [errorMessage, setErrorMessage] = React.useState<string>("");

    React.useEffect(() => {
        getPetition();
        getCategories();
        getSupporters();
    }, [id]);

    React.useEffect(() => {
        if (petition)
        getOwnersPetitions();
        getSameCategoryPetitions();
    }, [petition]);

    const handleClickSupport = (tier: SupportTier) => {
    };

    const handleMessageDialogClose = () => {
        setTierSelected(null);
        setMessage('');
    };

    const handleDeleteDialogClose = () => {
        setDeleteDialogOpen(false);
    };

    const getPetition = () => {
        axios.get(`https://seng365.csse.canterbury.ac.nz/api/v1/petitions/${id}`)
            .then((response) => {
                const p = response.data;
                if (p.moneyRaised === null) p.moneyRaised = 0;
                setPetition(p);
            })
            .catch((error) => {
                // if the id parameter is invalid
                navigate("/")
            });
    };

    const getCategories = () => {
        axios.get('https://seng365.csse.canterbury.ac.nz/api/v1/petitions/categories')
            .then((response) => {
                setCategories(response.data);
            })
            .catch((error) => {
                // this should not error
                console.log(error)
            });
    };

    const getSupporters = () => {
        axios.get(`https://seng365.csse.canterbury.ac.nz/api/v1/petitions/${id}/supporters`)
            .then((response) => {
                setSupporters(response.data);
            })
            .catch((error) => {
                // if this errors, it will not be a big deal as the page will be redirected immediately
                console.log(error)
            });
    };

    const getOwnersPetitions = () => {
        const params: PetitionSearchParams = {};
        params.ownerId = petition?.ownerId;
        axios.get('https://seng365.csse.canterbury.ac.nz/api/v1/petitions', { params })
            .then((response) => {
                setOwnersPetitions(response.data.petitions.filter((p: Petition) => p.petitionId !== petition?.petitionId));
            })
            .catch((error) => {
                // this should not error
                console.log(error);
            });
    };

    const getSameCategoryPetitions = () => {
        const params: PetitionSearchParams = {categoryIds: petition ? [petition.categoryId] : []};
        axios.get('https://seng365.csse.canterbury.ac.nz/api/v1/petitions', { params })
            .then((response) => {
                setSameCategoryPetitions(response.data.petitions.filter((p: Petition) => (p.petitionId !== petition?.petitionId && p.ownerId !== petition?.ownerId)));
            })
            .catch((error) => {
                // this should not error
                console.log(error);
            });
    };

    const supportPetition = () => {
        if (tierSelected) {
            const body: Support = { supportTierId: tierSelected.supportTierId }
            if (message.trim() !== "") {
                body.message = message;
            }
            axios.post(`https://seng365.csse.canterbury.ac.nz/api/v1/petitions/${id}/supporters`, body, {headers: {
                    "X-Authorization": userState.token}})
                .then((response) => {
                    setErrorMessage("");
                    getSupporters();
                    handleMessageDialogClose();
                })
                .catch((error) => {
                    setErrorMessage(error.response.statusText)
                });
        }
    };

    const deletePetition = () => {
        axios.delete(`https://seng365.csse.canterbury.ac.nz/api/v1/petitions/${id}`, {headers: {
                "X-Authorization": userState.token}})
            .then((response) => {
                navigate('/my-petitions')
            })
            .catch((error) => {
                // this should not error
                console.log(error);
            });
    };

    return (
        <Container disableGutters maxWidth={'xl'}>
            <Grid container spacing={2} p={2}>
                { petition?.ownerId.toString() === userState.id && (

                    <Grid container item xs={12} spacing={2}>
                        { supporters.length === 0 ? (
                            <Grid item xs={12} sm={12}>
                                <Button
                                    color="error"
                                    startIcon={<DeleteIcon />}
                                    onClick={() => setDeleteDialogOpen(true)}
                                >
                                    Delete petition
                                </Button>
                            </Grid>
                        ): (
                            <Grid item xs={12} sm={12}>
                                <Chip icon={<InfoIcon/>} variant={'outlined'} label="This petition cannot be deleted because it has at least one supporter"
                                      sx={{
                                          height: 'auto',
                                          '& .MuiChip-label': {
                                              display: 'block',
                                              whiteSpace: 'normal',
                                          },
                                          p: 1
                                      }}
                                />
                            </Grid>
                        )}
                        <Grid item xs={12} sm={12}>
                            <Button
                                startIcon={<EditIcon />}
                                onClick={() => navigate(`/petitions/${id}/edit`)}
                            >
                                Edit petition
                            </Button>
                        </Grid>
                    </Grid>
                )}
                <Grid item xs={12} sx={{ textAlign: 'left' }}>
                    <Typography variant='h3' component='div' textAlign={'left'}
                        sx={{ overflowWrap: 'break-word'}}>
                        {petition?.title}
                    </Typography>
                    <Chip variant={'filled'} label={categories.find(c => c.categoryId === petition?.categoryId)?.name}
                          sx={{
                              height: 'auto',
                              '& .MuiChip-label': {
                                  display: 'block',
                                  whiteSpace: 'normal',
                              },
                              overflowWrap: 'break-word',
                              p: 1,
                              color: 'white',
                              backgroundColor: 'rgba(0, 0, 0, 0.6)',
                          }}
                    />
                </Grid>
                <Grid item xs={12} md={8}>
                    <Stack>
                        <Box
                            component="img"
                            sx={{
                                maxHeight: 500,
                                objectFit: 'cover'
                            }}
                            alt={`${petition?.title}'s image`}
                            src={`https://seng365.csse.canterbury.ac.nz/api/v1/petitions/${petition?.petitionId}/image`}
                        />
                        <Avatar sx={{ my: 1, width: 64, height: 64}}
                                src={`https://seng365.csse.canterbury.ac.nz/api/v1/users/${petition?.ownerId}/image`} />
                        <Typography variant='h5' component='div' sx={{textAlign:"left"}}>
                            Created by {petition?.ownerFirstName} {petition?.ownerLastName}
                        </Typography>
                        <Typography textAlign={'left'} variant='subtitle1' component='div'>
                            {new Date(petition !== null ? petition.creationDate : "").toLocaleDateString('en-nz', {
                                day: '2-digit',
                                month: '2-digit',
                                year: '2-digit'
                            })}
                        </Typography>

                        <Typography textAlign={'left'} mt={2} variant='body1' component='div'>
                            {petition?.description}
                        </Typography>
                    </Stack>
                </Grid>
                <Grid item xs={12} md={4} >
                    <Paper elevation={5} sx={{color: 'goldenrod'}}>
                        <Typography p={1} sx={{ overflowWrap: 'break-word' }} variant='h4' component='div'>
                            ${petition?.moneyRaised} raised so far
                        </Typography>
                    </Paper>
                    {petition?.supportTiers.map((tier, index) => (
                        <Accordion elevation={5}>
                            <AccordionSummary sx={{ bgcolor: 'goldenrod', color:'white'}}
                                              expandIcon={<ExpandMoreIcon sx={{color: 'white'}}/>}
                            >
                                <Typography sx={{ overflowWrap: 'break-word' }} variant='h5' component='div'>
                                    {tier.title}
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Typography pb={1} sx={{ overflowWrap: 'break-word' }} variant='body1'>
                                    {tier.description}
                                </Typography>
                                <Button onClick={() => (userState.token ? setTierSelected(tier) : navigate("/login"))}
                                        fullWidth
                                        disabled={
                                            petition.ownerId.toString() === userState.id || supporters.some(s => s.supportTierId === tier.supportTierId && s.supporterId.toString() === userState.id)
                                        }
                                        sx={{
                                            bgcolor: petition.ownerId.toString() === userState.id || supporters.some(s => s.supportTierId === tier.supportTierId && s.supporterId.toString() === userState.id) ? 'lightgrey' : 'goldenrod',
                                            color: 'white',
                                            '&:hover': { bgcolor: 'darkgoldenrod' }
                                        }}>
                                    <Typography fontSize={20} variant='button' >
                                        Support this tier for ${tier.cost}
                                    </Typography>
                                </Button>
                                {petition.ownerId.toString() === userState.id &&
                                    <Chip icon={<InfoIcon/>} variant={'outlined'} label="You can't support your own petition"
                                          sx={{
                                              height: 'auto',
                                              '& .MuiChip-label': {
                                                  display: 'block',
                                                  whiteSpace: 'normal',
                                              },
                                              mt: 2,
                                              p: 1
                                          }}
                                    />
                                }
                                {supporters.some(s => s.supportTierId === tier.supportTierId && s.supporterId.toString() === userState.id) &&
                                    <Chip icon={<InfoIcon/>} variant={'outlined'} label="You can only support each tier once"
                                          sx={{
                                              height: 'auto',
                                              '& .MuiChip-label': {
                                                  display: 'block',
                                                  whiteSpace: 'normal',
                                              },
                                              mt: 2,
                                              p: 1
                                          }}
                                    />
                                }
                            </AccordionDetails>
                        </Accordion>
                    ))}

                    <Typography textAlign={'center'} fontSize={20} mt={3} variant='h5' component='div'>
                        {(petition?.numberOfSupporters === 0) ? 'Become the first supporter!' : `Join ${petition?.numberOfSupporters} OtherKind Supporter${(petition?.numberOfSupporters !== 1) ? 's' : ''}`}
                    </Typography>
                    <List
                        sx={{
                            overflow: 'auto',
                            maxWidth: 600,
                            maxHeight: 400,
                        }}
                    >
                        {supporters.map((supporter) => (
                            <ListItem>
                                <ListItemAvatar>
                                    <Avatar src={`https://seng365.csse.canterbury.ac.nz/api/v1/users/${supporter.supporterId}/image`} />
                                </ListItemAvatar>
                                <ListItemText
                                    primary={`${supporter.supporterFirstName} ${supporter.supporterLastName} ${supporter.message !== null ? ` says "${supporter.message}"` : ""}`}
                                    secondary={`Supported the '${petition?.supportTiers.find(st => st.supportTierId === supporter.supportTierId)?.title }' tier on ${new Date(petition !== null ? petition.creationDate : "").toLocaleDateString('en-nz', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: '2-digit',
                                    })}`}
                                />
                            </ListItem>
                        ))}
                    </List>
                </Grid>
                <Grid item xs={12}>
                    {ownersPetitions.length > 0 && (
                        <Stack>
                            <Typography textAlign={'left'} variant='overline' component='div'>
                                More from {petition?.ownerFirstName} {petition?.ownerLastName}
                            </Typography>
                            <PetitionCardList petitions={ownersPetitions} categories={categories} cardsPerPage={4}/>
                        </Stack>
                    )}
                    {sameCategoryPetitions.length > 0 && (
                        <Stack>
                            <Typography textAlign={'left'} variant='overline' component='div'>
                                More in this category
                            </Typography>
                            <PetitionCardList petitions={sameCategoryPetitions} categories={categories}
                                              cardsPerPage={4}/>
                        </Stack>
                    )}
                </Grid>
            </Grid>
            <Dialog onClose={handleMessageDialogClose} open={tierSelected !== null}
                    TransitionProps={{
                        timeout: 0
                    }}
            >
                <DialogTitle>
                    <Typography variant='h5' textAlign={'center'}>
                        Support the {' '}
                        <Typography display={'inline-block'} variant='h5' color={'goldenrod'}>
                            {tierSelected?.title}
                        </Typography>
                        {' '} tier
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <Grid container gap={2} justifyContent={'center'} p={1} textAlign={'center'}>
                        <Grid item xs={12}>
                            <Typography textAlign={'center'} sx={{ overflowWrap: 'break-word' }} variant='body1'>
                                {tierSelected?.description}
                            </Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                helperText="Not required"
                                variant={'outlined'}
                                placeholder='Enter message'
                                multiline
                                fullWidth
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                            />
                        </Grid>
                        {errorMessage.trim() !== "" && (
                            <Grid item xs={12}>
                                <Chip icon={<ErrorIcon/>} color={'error'} variant={'outlined'} label={errorMessage}
                                      sx={{
                                          height: 'auto',
                                          '& .MuiChip-label': {
                                              display: 'block',
                                              whiteSpace: 'normal',
                                          },
                                          p: 1
                                      }}
                                />
                            </Grid>
                        )}
                        <Grid item xs={12}>
                            <Button onClick={supportPetition}
                                    fullWidth
                                    sx={{
                                        bgcolor: 'goldenrod',
                                        color: 'white',
                                        '&:hover': { bgcolor: 'darkgoldenrod' }
                                    }}>
                                <Typography fontSize={20} variant='button'>
                                    Support for ${tierSelected?.cost}
                                </Typography>
                            </Button>
                        </Grid>
                    </Grid>
                </DialogContent>
            </Dialog>
            <Dialog onClose={handleDeleteDialogClose} open={deleteDialogOpen}
                    TransitionProps={{
                        timeout: 0
                    }}
            >
                <DialogTitle>
                    <Typography variant='h5' textAlign={'center'}>
                        Delete petition
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <Grid container gap={2} justifyContent={'center'} p={1}>
                        <Grid item xs={12}>
                            <Typography textAlign={'center'} sx={{ overflowWrap: 'break-word' }} variant='body1'>
                                Are you sure you want to delete this petition?
                            </Typography>
                            <Typography textAlign={'center'} sx={{ overflowWrap: 'break-word' }} variant='body1'>
                                This action cannot be undone!
                            </Typography>
                        </Grid>

                        <Grid item xs={12}>
                            <Button onClick={() => {deletePetition(); handleDeleteDialogClose();}}
                                    fullWidth
                                    color={'error'}
                                    variant={'contained'}
                            >
                                <Typography fontSize={20} variant='button'>
                                    Delete petition
                                </Typography>
                            </Button>
                        </Grid>
                        <Grid item xs={12}>
                            <Button onClick={handleDeleteDialogClose}
                                    fullWidth
                                    variant={'contained'}
                            >
                                <Typography fontSize={20} variant='button'>
                                    Cancel
                                </Typography>
                            </Button>
                        </Grid>
                    </Grid>
                </DialogContent>
            </Dialog>
        </Container>
    );
}