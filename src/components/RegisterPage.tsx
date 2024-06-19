import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import EditIcon from '@mui/icons-material/Edit';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import {Chip, InputAdornment, Stack} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import {Visibility, VisibilityOff} from "@mui/icons-material";
import axios from "axios";
import {useNavigate} from "react-router-dom";
import {useUserStore} from "../store";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import ErrorIcon from "@mui/icons-material/Error";

export default function RegisterPage() {
    const navigate = useNavigate();
    const userState = useUserStore();

    const [profilePicturePreview, setProfilePicturePreview] = React.useState<string | null>(null);
    const [submittable, setSubmittable] = React.useState<boolean>(false);

    const [profilePicture, setProfilePicture] = React.useState<File | null>(null);
    const [firstName, setFirstName] = React.useState<string>("");
    const [lastName, setLastName] = React.useState<string>("");
    const [email, setEmail] = React.useState<string>("");
    const [password, setPassword] = React.useState<string>("");
    const [showPassword, setShowPassword] = React.useState<boolean>(false);

    const [errorMessage, setErrorMessage] = React.useState<string>("");

    React.useEffect(() => {
        if (userState.token) navigate(`/`);
    }, []);

    React.useEffect(() => {
        if (submittable) {
            setSubmittable(false);
            createUser();
        }
    }, [submittable]);

    const handlePictureFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const file = event.target.files[0];

            const validTypes = ['image/png', 'image/jpeg', 'image/gif'];
            if (!validTypes.includes(file.type)) {
                setErrorMessage('Profile picture file type must be PNG, JPEG, or GIF');
                return;
            }

            const maxSize = 5 * 1024 * 1024;
            if (file.size > maxSize) {
                setErrorMessage('Profile picture file must be smaller than 5MB');
                return;
            }

            setErrorMessage('');
            setProfilePicture(file);
            setProfilePicturePreview(URL.createObjectURL(file));
        }
    };

    const handleClickRemoveImage = () => {
        setProfilePicture(null);
        setProfilePicturePreview(null);
    };

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setFirstName(data.get("firstName") as string);
        setLastName(data.get("lastName") as string);
        setEmail(data.get("email") as string);
        setPassword(data.get("password") as string);
        setSubmittable(true);
    };

    const createUser = () => {
        const body = {
            email: email,
            firstName: firstName,
            lastName: lastName,
            password: password
        }
        axios.post('https://seng365.csse.canterbury.ac.nz/api/v1/users/register', body)
            .then(() => {
                setErrorMessage("");
                authorizeUser()
            })
            .catch((error) => {
                const status = error.response.status;
                const statusText: string = error.response.statusText;
                if (status === 403) {
                    setErrorMessage("Email already in use")
                } else if (statusText.includes("firstName")) {
                    setErrorMessage("First name must be between 1 and 64 characters long")
                } else if (statusText.includes("lastName")) {
                    setErrorMessage("Last name must be between 1 and 64 characters long")
                } else if (statusText.includes("email must match format")) {
                    setErrorMessage("Email must be of the form 'adam@example.com'");
                } else if (statusText.includes("email")) {
                    setErrorMessage("Email must be between 1 and 256 characters long");
                } else if (statusText.includes("password")) {
                    setErrorMessage("Password must be between 6 and 64 characters long")
                }
            });
    };

    const authorizeUser = () => {
        const body = {
            email: email,
            password: password
        }
        axios.post('https://seng365.csse.canterbury.ac.nz/api/v1/users/login', body)
            .then((response) => {
                userState.setId(response.data.userId.toString());
                userState.setToken(response.data.token);
                addPicture(response.data.userId.toString(), response.data.token);
            })
            .catch((error) => {
                // shouldn't error as it would be caught in the register step
                console.log(error);
            });
    };

    const addPicture = (userId: string, token: string) => {
        if (profilePicture) {
            axios.put(`https://seng365.csse.canterbury.ac.nz/api/v1/users/${userId}/image`, profilePicture,
                {headers: {
                        "Content-Type": profilePicture.type,
                        "X-Authorization": token}
                })
                .then((response) => {
                    window.location.reload();
                })
                .catch((error) => {
                });
        }
        navigate('/')
    };

    return (
        <Container component="main" maxWidth="xs">
            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
                <Grid container spacing={2}>
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
                        <Typography variant='h2'>
                            Register
                        </Typography>
                        <Stack alignItems={"center"}>
                            <Avatar src={profilePicturePreview ? profilePicturePreview : undefined} sx={{ m: 1, width: 128, height: 128}}></Avatar>
                            <Button
                                component="label"
                                startIcon={
                                    profilePicturePreview ? <EditIcon/> : <FileUploadIcon/>
                                }
                            >
                                {
                                    profilePicturePreview ? "Change Image" : "Upload Image"
                                }
                                <input hidden type="file" onChange={handlePictureFileChange}/>
                            </Button>
                            {profilePicturePreview &&
                                <Button
                                    color={"warning"}
                                    startIcon={<DeleteIcon />}
                                    onClick={handleClickRemoveImage}
                                >
                                    Remove Image
                                </Button>
                            }
                        </Stack>
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            id="firstName"
                            autoComplete="given-name"
                            name="firstName"
                            label="First Name"
                            required
                            fullWidth
                            autoFocus
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            id="lastName"
                            autoComplete="family-name"
                            name="lastName"
                            label="Last Name"
                            required
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            id="email"
                            autoComplete="email"
                            name="email"
                            label="Email Address"
                            required
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            id="password"
                            autoComplete="new-password"
                            name="password"
                            label="Password"
                            required
                            fullWidth
                            type={showPassword ? 'text' : 'password'}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position={"end"}>
                                        <IconButton
                                            size="small"
                                            onClick={handleClickShowPassword}
                                        >
                                            {showPassword ? (
                                                <VisibilityOff fontSize="small" />
                                            ) : (
                                                <Visibility fontSize="small" />
                                            )}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                        >
                            Register
                        </Button>
                    </Grid>
                    <Grid item xs={12}>
                        <Link onClick={() => navigate("/login")} variant="body2" sx={{cursor: 'pointer'}}>
                            Already have an account? Log in here
                        </Link>
                    </Grid>
                </Grid>
            </Box>
        </Container>
    );
}