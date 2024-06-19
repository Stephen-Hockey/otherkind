import * as React from "react";
import axios from "axios";
import Typography from "@mui/material/Typography";
import {
    Autocomplete, AutocompleteChangeReason, cardClasses, Chip,
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
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import AddIcon from "@mui/icons-material/Add";
import FileUploadIcon from '@mui/icons-material/FileUpload';
import CheckIcon from '@mui/icons-material/Check';
import {useNavigate} from "react-router-dom";
import {SyntheticEvent} from "react";
import InfoIcon from "@mui/icons-material/Info";
import ErrorIcon from "@mui/icons-material/Error";

export default function CreatePetitionPage() {
    const navigate = useNavigate();
    const userState = useUserStore();

    const [categories, setCategories] = React.useState<Array<Category>>([]);
    const [heroImagePreview, setHeroImagePreview] = React.useState<string | null>(null);

    const [title, setTitle] = React.useState<string>("");
    const [category, setCategory] = React.useState<Category | null>(null);
    const [description, setDescription] = React.useState<string>("");
    const [supportTiers, setSupportTiers] = React.useState<Array<SupportTierCreate>>([{index: 0, title: "", description: "", cost: "", hasSupport: false}]);
    const [heroImage, setHeroImage] = React.useState<File | null>(null);

    const [errorMessage, setErrorMessage] = React.useState<string>("");

    React.useEffect(() => {
        if (!userState.token) navigate('/login');
        getCategories();
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

    const handleClickCreatePetition = () => {
        createPetition();
    };

    const createPetition = () => {
        const body = {
            title: title,
            description: description,
            categoryId: category?.categoryId,
            supportTiers: supportTiers.map(({ index, cost, ...tier }) => ({...tier, cost: parseInt(cost, 10)}))
        }
        axios.post('https://seng365.csse.canterbury.ac.nz/api/v1/petitions', body, {headers: {
                "X-Authorization": userState.token}
        })
            .then((response) => {
                setErrorMessage("");
                addHeroImage(response.data.petitionId.toString());
            })
            .catch((error) => {
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
                } else if (statusText.includes("unique titles")) {
                    setErrorMessage("Support tiers must have unique titles")
                } else if (statusText.includes("title")) {
                    setErrorMessage("Tier title must be between 1 and 128 characters long")
                } else if (statusText.includes("description")) {
                    setErrorMessage("Tier description must be between 1 and 1024 characters long")
                } else if (statusText.includes("cost")) {
                    setErrorMessage("Cost is required and must be a positive integer")
                }
            });
    }

    const addHeroImage = (petitionId: string) => {
        if (heroImage) {
            axios.put(`https://seng365.csse.canterbury.ac.nz/api/v1/petitions/${petitionId}/image`, heroImage,
                {headers: {
                        "Content-Type": heroImage.type,
                        "X-Authorization": userState.token}
                })
                .then((response) => {
                    navigate(`/petitions/${petitionId}`)
                })
                .catch((error) => {
                });
        } else {
            deletePetition(petitionId);
            setErrorMessage("Hero Image is required");
        }
    };

    const deletePetition = (petitionId: string) => {
        axios.delete(`https://seng365.csse.canterbury.ac.nz/api/v1/petitions/${petitionId}`, {headers: {
                    "X-Authorization": userState.token}
            })
            .catch((error) => {
                // this shouldn't error
                console.log(error)
            });
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
                            <TextField {...params} label="Select category" required/>
                        )}
                        value={category}
                        onChange={handleSelectCategoryChange}
                    />
                </Grid>
                <Grid item xs={12} md={8}>
                    <Stack gap={2}>
                        <Button
                            component="label"
                            startIcon={
                                heroImagePreview ? <EditIcon/> : <FileUploadIcon/>
                            }
                        >
                            {
                                heroImagePreview ? "Change Hero Image" : "Upload Hero Image *"
                            }

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
                                    <Stack>
                                        <Typography color='grey' textAlign={'left'}>
                                            Tier {tier.index + 1}
                                        </Typography>
                                        <TextField
                                            required
                                            variant='outlined'
                                            placeholder='Enter tier title'
                                            multiline
                                            fullWidth
                                            value={tier.title}
                                            onChange={(e) => handleTierTitleChange(e, tier.index)}
                                            InputProps={{
                                                style: {
                                                    fontSize: 24,
                                                    color: 'white',
                                                    backgroundColor: "goldenrod"
                                                },
                                            }}
                                        />
                                        <TextField
                                            variant={'outlined'}
                                            placeholder='Enter tier description'
                                            multiline
                                            fullWidth
                                            value={tier.description}
                                            onChange={(e) => handleTierDescriptionChange(e, tier.index)}
                                        />
                                        <TextField
                                            variant="outlined"
                                            type="number"
                                            placeholder={'Enter cost to support this tier'}
                                            InputProps={{
                                                startAdornment: <InputAdornment position="start"><AttachMoneyIcon/></InputAdornment>,
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
                        endIcon={<CheckIcon/>}
                        onClick={handleClickCreatePetition}
                        variant={'contained'}
                        sx={{
                            p: 5
                        }}
                    >
                        <Typography fontSize={20} variant='button'>
                            Create petition
                        </Typography>
                    </Button>
                </Grid>
            </Grid>
        </Container>
    );
}