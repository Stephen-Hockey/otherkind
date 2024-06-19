import * as React from "react";
import axios from "axios";
import Typography from "@mui/material/Typography";
import {
    Accordion, AccordionDetails, AccordionSummary, Autocomplete, AutocompleteChangeReason, Chip,
    FormControl, InputAdornment, InputLabel,
    Select, SelectChangeEvent, Stack
} from "@mui/material";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import {useUserStore} from "../store";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import InfoIcon from '@mui/icons-material/Info';
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import AddIcon from "@mui/icons-material/Add";
import FileUploadIcon from '@mui/icons-material/FileUpload';
import CheckIcon from '@mui/icons-material/Check';
import {useNavigate, useParams} from "react-router-dom";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {SyntheticEvent} from "react";
import ErrorIcon from "@mui/icons-material/Error";

export default function EditPetitionPage() {
    const navigate = useNavigate();
    const {id} = useParams();
    const userState = useUserStore();

    const [categories, setCategories] = React.useState<Array<Category>>([]);
    const [originalTierIds, setOriginalTierIds] = React.useState<Array<number>>([]);
    const [heroImagePreview, setHeroImagePreview] = React.useState<string | null>(null);

    const [title, setTitle] = React.useState<string>("");
    const [category, setCategory] = React.useState<Category | null>(null);
    const [description, setDescription] = React.useState<string>("");
    const [supportTiers, setSupportTiers] = React.useState<Array<SupportTierCreate>>([]);
    const [heroImage, setHeroImage] = React.useState<File | null>(null);

    const [errorMessage, setErrorMessage] = React.useState<string>("");

    React.useEffect(() => {
        if (!userState.token) navigate(`/petitions/${id}`);
        getCategories();
    }, []);

    React.useEffect(() => {
        getPetitionDetails();
    }, [categories]);

    React.useEffect(() => {
        setErrorMessage("");
    }, []);

    const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setTitle(event.target.value);
    };

    const handleSelectCategoryChange = (event: SyntheticEvent<Element, Event>, cat: Category | null, reason: AutocompleteChangeReason) => {
        setCategory(cat);
    };

    const handleHeroImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const file = event.target.files[0];

            const validTypes = ['image/png', 'image/jpeg', 'image/gif'];
            if (!validTypes.includes(file.type)) {
                setErrorMessage('Hero image file type must be PNG, JPEG, or GIF');
                return;
            }

            const maxSize = 5 * 1024 * 1024;
            if (file.size > maxSize) {
                setErrorMessage('Hero image file must be smaller than 5MB');
                return;
            }

            setErrorMessage('');
            setHeroImage(file);
            setHeroImagePreview(URL.createObjectURL(file));
        }
    };

    const handleDescriptionChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setDescription(event.target.value);
    };

    const handleTierTitleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index: number) => {
        setSupportTiers(supportTiers.map((tier, i) => i === index ? { ...tier, title: event.target.value } : tier));
    };

    const handleTierDescriptionChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index: number) => {
        setSupportTiers(supportTiers.map((tier, i) => i === index ? { ...tier, description: event.target.value } : tier));
    };

    const handleTierCostChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index: number) => {
        const cost = event.target.value;
        setSupportTiers(supportTiers.map((tier, i) => i === index ? { ...tier, cost: cost } : tier));
    };

    const handleClickAddTier = () => {
        setSupportTiers(prevTiers => [...prevTiers, {index: prevTiers.length, title: "", description: "", cost: "", hasSupport: false}]);
    };

    const handleClickRemoveTier = (index: number) => {
        setSupportTiers(prevTiers => {
            const updatedTiers = prevTiers
                .filter(tier => tier.index !== index)
                .map((tier, i) => ({ ...tier, index: i }));
            return updatedTiers;
        });
    };

    const handleClickEditPetition = () => {
        updateHeroImage();
    };

    const getCategories = () => {
        axios.get('https://seng365.csse.canterbury.ac.nz/api/v1/petitions/categories')
            .then((response) => {
                setCategories(response.data);
            })
            .catch((error) => {
                // this shouldn't error
                console.log(error)
            });
    };

    const getSupporters = (tiers: SupportTier[]) => {
        axios.get(`https://seng365.csse.canterbury.ac.nz/api/v1/petitions/${id}/supporters`)
            .then((response) => {
                const supportedTierIds = Array.from(new Set(response.data.map((support: Supporter) => support.supportTierId)));
                setSupportTiers(tiers.map((tier, index) =>
                    supportedTierIds.includes(tier.supportTierId) ? { ...tier, index: index, cost: tier.cost.toString(),  hasSupport: true } : { ...tier, index: index, cost: tier.cost.toString(), hasSupport: false }
                ));
            })
            .catch((error) => {
                // this shouldn't error
                console.log(error)
            });
    };

    const getPetitionDetails = () => {
        axios.get(`https://seng365.csse.canterbury.ac.nz/api/v1/petitions/${id}`)
            .then((response) => {
                const petition: PetitionDetails = response.data

                if (userState.id !== petition.ownerId.toString()) {
                    navigate(`/petitions/${id}`);
                    return;
                }

                setOriginalTierIds(petition.supportTiers.map(tier => tier.supportTierId))
                setTitle(petition.title);
                setDescription(petition.description);
                setCategory(categories.find(c => c.categoryId === petition.categoryId) || null);
                getSupporters(petition.supportTiers);
                getExistingHeroImage();
            })
            .catch((error) => {
                navigate(`/`);
            });
    };

    const getExistingHeroImage = () => {
        axios.get(`https://seng365.csse.canterbury.ac.nz/api/v1/petitions/${id}/image`)
            .then((response) => {
                setHeroImage(response.data);
                setHeroImagePreview(`https://seng365.csse.canterbury.ac.nz/api/v1/petitions/${id}/image`);
            })
            .catch((error) => {
                // this shouldn't error
                console.log(error)
            });
    };

    const updateHeroImage = () => {
        if (heroImage) {
            axios.put(`https://seng365.csse.canterbury.ac.nz/api/v1/petitions/${id}/image`, heroImage,
                {headers: {
                        "Content-Type": heroImage.type,
                        "X-Authorization": userState.token}
                })
                .then((response) => {
                    editPetition();
                })
                .catch((error) => {
                    editPetition();
                });
        }
    };

    const editPetition = () => {
        if (category === null) {
            setErrorMessage("Category is required");
            return;
        }
        const tierTitles: string[] = [];
        for (const tier of supportTiers) {
            if (!tier.hasSupport) {
                if (tier.title.length < 1 || tier.title.length > 128) {
                    setErrorMessage("Tier title must be between 1 and 128 characters long");
                    return;
                }
                if (tier.description.length < 1 || tier.description.length > 1024) {
                    setErrorMessage("Tier description must be between 1 and 1024 characters long");
                    return;
                }
                if (!/^\d+$/.test(tier.cost)) {
                    setErrorMessage("Cost is required and must be a positive integer");
                    return;
                }
            }
            if (tierTitles.includes(tier.title.toLowerCase())) {
                setErrorMessage("Support tiers must have unique titles");
                return;
            }
            tierTitles.push(tier.title.toLowerCase());
        }

        setErrorMessage("");
        const body = {
            title: title,
            description: description,
            categoryId: category?.categoryId,
        }
        axios.patch(`https://seng365.csse.canterbury.ac.nz/api/v1/petitions/${id}`, body, {headers: {
                "X-Authorization": userState.token}
        })
            .then((response) => {
                supportTiers.forEach(tier => {
                    if (!tier.hasSupport) {
                        tier.supportTierId === undefined ? createTier(tier) : updateTier(tier);
                    }
                });
                const newTierIds = supportTiers.map(tier => tier.supportTierId);
                originalTierIds.forEach(originalTierId => !newTierIds.includes(originalTierId) && removeTier(originalTierId));
                navigate(`/petitions/${id}`);
            })
            .catch((error) => {
                // some errors are handled above
                const status = error.response.status;
                const statusText: string = error.response.statusText;
                if (status === 403) {
                    setErrorMessage("Petition title already exists, please choose a different one");
                } else if (statusText.includes("categoryId")) {
                    setErrorMessage("Category is a required field")
                } else if (statusText.includes("data/title")) {
                    setErrorMessage("Title must be between 1 and 128 characters long")
                } else if (statusText.includes("data/description")) {
                    setErrorMessage("Description must be between 1 and 1024 characters long")
                }
            });
    }

    const createTier = (tier: SupportTierCreate) => {
        const body = {
            title: tier.title,
            description: tier.description,
            cost: parseInt(tier.cost, 10)
        }
        axios.put(`https://seng365.csse.canterbury.ac.nz/api/v1/petitions/${id}/supportTiers`, body, {headers: {
                "X-Authorization": userState.token}
        })
            .then((response) => {

            })
            .catch((error) => {
                console.log(error)
            });
    }

    const updateTier = (tier: SupportTierCreate) => {
        const body = {
            title: tier.title,
            description: tier.description,
            cost: parseInt(tier.cost, 10)
        }
        axios.patch(`https://seng365.csse.canterbury.ac.nz/api/v1/petitions/${id}/supportTiers/${tier.supportTierId}`, body, {headers: {
                "X-Authorization": userState.token}
        })
            .then((response) => {

            })
            .catch((error) => {
                console.log(error)
            });
    }

    const removeTier = (tierId: number) => {
        axios.delete(`https://seng365.csse.canterbury.ac.nz/api/v1/petitions/${id}/supportTiers/${tierId}`, {headers: {
                "X-Authorization": userState.token}
        })
            .then((response) => {

            })
            .catch((error) => {
                console.log(error)
            });
    }

    return (
        <Container disableGutters maxWidth={'xl'}>
            <Grid container spacing={2} p={2}>
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
                    <TextField
                        required
                        label={'Title'}
                        variant={'outlined'}
                        placeholder='Enter petition title'
                        multiline
                        fullWidth
                        value={title}
                        onChange={handleTitleChange}
                        InputLabelProps={{
                            style: {
                                fontSize: 32
                            },
                        }}
                        InputProps={{
                            style: {
                                fontSize: 32
                            },
                        }}
                    />
                </Grid>
                <Grid item xs={12} textAlign={'left'}>
                    <Autocomplete
                        noOptionsText="No categories found"
                        options={categories}
                        getOptionLabel={(option) => option.name}
                        isOptionEqualToValue={(option, value) => option.categoryId === value.categoryId}
                        renderInput={(params) => (
                            <TextField {...params} label="Select category" required />
                        )}
                        value={category}
                        onChange={handleSelectCategoryChange}
                    />
                </Grid>
                <Grid item xs={12} md={8}>
                    <Stack gap={2}>
                        <Button
                            component="label"
                            startIcon={<EditIcon/>}
                        >
                            Change Hero Image
                            <input hidden type="file" onChange={handleHeroImageChange}/>
                        </Button>
                        {
                            heroImagePreview && <Box
                                component="img"
                                sx={{
                                    maxHeight: 500,
                                    objectFit: 'cover'
                                }}
                                src={heroImagePreview}
                            />
                        }
                        <TextField
                            required
                            variant={'outlined'}
                            label={'Description'}
                            placeholder='Enter description'
                            multiline
                            minRows={3}
                            fullWidth
                            value={description}
                            onChange={handleDescriptionChange}
                        />
                    </Stack>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Chip icon={<InfoIcon/>} variant={'outlined'} label="You must have at least 1 support tier"
                          sx={{
                              height: 'auto',
                              '& .MuiChip-label': {
                                  display: 'block',
                                  whiteSpace: 'normal',
                              },
                              p: 1
                          }}
                    />
                    <Grid container gap={2}>
                        {supportTiers.map((tier) => (
                            <Grid container item xs={12} key={tier.index}>
                                <Grid item xs={12}>

                                    <Typography color='grey' textAlign={'left'}>
                                        Tier {tier.index + 1}
                                    </Typography>

                                    {tier.hasSupport ? (
                                        <Accordion elevation={5}>
                                            <AccordionSummary sx={{ bgcolor: 'lightgrey', color:'white'}}
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
                                                <Button fullWidth disabled
                                                        sx={{
                                                            bgcolor: 'lightgrey',
                                                            color: 'white',
                                                        }}>
                                                    <Typography fontSize={20} variant='button' color={'white'}>
                                                        Support this tier for ${tier.cost}
                                                    </Typography>
                                                </Button>
                                                <Chip icon={<InfoIcon />} variant={'outlined'} label="This tier cannot be edited or deleted because it has at least one supporter"
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
                                            </AccordionDetails>
                                        </Accordion>
                                    ) : (
                                        <Stack>
                                            <Typography sx={{overflowWrap: 'break-word'}} variant='h5' component='div'>
                                                <TextField
                                                    variant='outlined'
                                                    placeholder='Enter tier title'
                                                    multiline
                                                    fullWidth
                                                    sx={{
                                                        '& .MuiInputBase-root': {
                                                            fontSize: 'inherit',
                                                            color: 'white',
                                                            backgroundColor: 'goldenrod'
                                                        }
                                                    }}
                                                    value={tier.title}
                                                    onChange={(e) => handleTierTitleChange(e, tier.index)}
                                                />
                                            </Typography>

                                            <Typography sx={{overflowWrap: 'break-word'}} variant='body1'>
                                                <TextField
                                                    variant={'outlined'}
                                                    placeholder='Enter tier description'
                                                    multiline
                                                    fullWidth
                                                    sx={{
                                                        '& .MuiInputBase-root': {
                                                            fontSize: 'inherit',
                                                            color: 'inherit'
                                                        }
                                                    }}
                                                    value={tier.description}
                                                    onChange={(e) => handleTierDescriptionChange(e, tier.index)}
                                                />
                                            </Typography>
                                            <TextField
                                                variant="outlined"
                                                type="number"
                                                placeholder={'Enter cost to support this tier'}
                                                InputProps={{
                                                    startAdornment: <InputAdornment
                                                        position="start"><AttachMoneyIcon/></InputAdornment>,
                                                }}
                                                value={tier.cost}
                                                onChange={(e) => handleTierCostChange(e, tier.index)}
                                            />
                                            {supportTiers.length > 1 && (
                                                <Button fullWidth color={'warning'} startIcon={<DeleteIcon/>}
                                                        onClick={() => handleClickRemoveTier(tier.index)}>
                                                    <Typography fontSize={20} variant='button'>
                                                        Remove Tier
                                                    </Typography>
                                                </Button>
                                            )}
                                        </Stack>
                                    )}
                                </Grid>
                            </Grid>
                        ))}
                        {supportTiers.length < 3 && (
                            <Button
                                fullWidth
                                sx={{
                                    bgcolor: 'goldenrod',
                                    color: 'white',
                                    '&:hover': {bgcolor: 'darkgoldenrod'}
                                }}
                                startIcon={<AddIcon/>}
                                onClick={handleClickAddTier}
                            >
                                <Typography fontSize={20} variant='button'>
                                    Add tier
                                </Typography>
                            </Button>
                        )}

                    </Grid>
                </Grid>
                <Grid item xs={12} sx={{ display: 'flex', justifyContent: {xs: 'center', sm: 'end'} }}>
                    <Button
                        endIcon={<EditIcon/>}
                        onClick={handleClickEditPetition}
                        variant={'contained'}
                        sx={{
                            p: 5
                        }}
                    >
                        <Typography fontSize={20} variant='button'>
                            Save changes
                        </Typography>
                    </Button>
                </Grid>
            </Grid>
        </Container>
    );
}