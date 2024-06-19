import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import {Chip, InputAdornment, Stack} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import {Visibility, VisibilityOff} from "@mui/icons-material";
import axios from "axios";
import {useNavigate} from "react-router-dom";
import {useUserStore} from "../store";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import ErrorIcon from "@mui/icons-material/Error";

export default function EditProfilePage() {
    const navigate = useNavigate();
    const userState = useUserStore();

    const [profilePicturePreview, setProfilePicturePreview] = React.useState<string | null>(null);
    const [submittable, setSubmittable] = React.useState<boolean>(false);

    const [profilePicture, setProfilePicture] = React.useState<File | null>(null);
    const [firstName, setFirstName] = React.useState<string>("");
    const [lastName, setLastName] = React.useState<string>("");
    const [email, setEmail] = React.useState<string>("");
    const [currentPassword, setCurrentPassword] = React.useState<string>("");
    const [showCurrentPassword, setShowCurrentPassword] = React.useState<boolean>(false);
    const [newPassword, setNewPassword] = React.useState<string>("");
    const [showNewPassword, setShowNewPassword] = React.useState<boolean>(false);

    const [errorMessage, setErrorMessage] = React.useState<string>("");

    React.useEffect(() => {
        if (!userState.token) navigate('/login');
        getUser();
    }, []);

    React.useEffect(() => {
        if (submittable) {
            setSubmittable(false);
            editUser();
        }
    }, [submittable]);

    const handlePictureFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const file = event.target.files[0];

            const validTypes = ['image/png', 'image/jpeg', 'image/gif'];
            if (!validTypes.includes(file.type)) {
                setErrorMessage('File type must be PNG, JPEG, or GIF');
                return;
            }

            const maxSize = 5 * 1024 * 1024;
            if (file.size > maxSize) {
                setErrorMessage('File must be smaller than 5MB');
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

    const handleClickShowCurrentPassword = () => {
        setShowCurrentPassword(!showCurrentPassword);
    };

    const handleClickShowNewPassword = () => {
        setShowNewPassword(!showNewPassword);
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setFirstName(data.get("firstName") as string);
        setLastName(data.get("lastName") as string);
        setEmail(data.get("email") as string);
        setNewPassword(data.get("newPassword") as string);
        setCurrentPassword(data.get("currentPassword") as string);
        setSubmittable(true);
    };

    const getUser = () => {
        axios.get(`https://seng365.csse.canterbury.ac.nz/api/v1/users/${userState.id}`, {headers: {
                "X-Authorization": userState.token}
            })
            .then((response) => {
                setFirstName(response.data.firstName);
                setLastName(response.data.lastName);
                setEmail(response.data.email);
                getExistingPicture();
            })
            .catch((error) => {
                // this should not error
                console.log(error)
            });
    };

    const getExistingPicture = () => {
        axios.get(`https://seng365.csse.canterbury.ac.nz/api/v1/users/${userState.id}/image`)
            .then((response) => {
                setProfilePicture(response.data);
                if (response.data) setProfilePicturePreview(`https://seng365.csse.canterbury.ac.nz/api/v1/users/${userState.id}/image`);
            })
            .catch((error) => {
                // this will error every time the user doesn't have a profile picture but that doesn't matter
            });
    };

    const editUser = () => {
        const body: EditUserBody = { email: email, firstName: firstName, lastName: lastName };
        if (newPassword.length > 0 || currentPassword.length > 0) {
            body.password = newPassword;
            body.currentPassword = currentPassword;
        };
        axios.patch(`https://seng365.csse.canterbury.ac.nz/api/v1/users/${userState.id}`, body, {headers: {
                "X-Authorization": userState.token}
            })
            .then((response) => {
                setErrorMessage("");
                profilePicture === null ? deletePicture() : updatePicture();
            })
            .catch((error) => {
                const status = error.response.status;
                const statusText: string = error.response.statusText;
                if (status === 401) {
                    setErrorMessage("Your current password is incorrect")
                } else if (statusText.includes("Email already in use")) {
                    setErrorMessage("Email already in use")
                } else if (statusText.includes("Incorrect currentPassword")) {
                    setErrorMessage("Email already in use")
                } else if (statusText.includes("firstName")) {
                    setErrorMessage("First name must be between 1 and 64 characters long")
                } else if (statusText.includes("lastName")) {
                    setErrorMessage("Last name must be between 1 and 64 characters long")
                } else if (statusText.includes("email must match format")) {
                    setErrorMessage("Email must be of the form 'adam@example.com'");
                } else if (statusText.includes("email")) {
                    setErrorMessage("Email must be between 1 and 256 characters long");
                } else if (statusText.includes("New password can not be the same as old password")) {
                    setErrorMessage(statusText)
                } else if (statusText.includes("currentPassword")) {
                    setErrorMessage("Current password must be between 6 and 64 characters long")
                } else if (statusText.includes("password")) {
                    setErrorMessage("Password must be between 6 and 64 characters long")
                }
            });
    };

    const updatePicture = () => {
        if (profilePicture) {
            axios.put(`https://seng365.csse.canterbury.ac.nz/api/v1/users/${userState.id}/image`, profilePicture,
                {headers: {
                        "Content-Type": profilePicture.type,
                        "X-Authorization": userState.token}
                })
                .then((response) => {
                    window.location.reload();
                })
                .catch((error) => {
                    // this will error if you do not change the picture. this is fine.
                });
        }
        navigate('/')
    };

    const deletePicture = () => {
        axios.delete(`https://seng365.csse.canterbury.ac.nz/api/v1/users/${userState.id}/image`, {headers: {
                    "X-Authorization": userState.token}
            })
            .then((response) => {
                window.location.reload();
            })
            .catch((error) => {
                // this means the picture doesn't exist already
            });
        navigate('/')
    };

    return (
        <Container component="main" maxWidth="xs">
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
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
                            Edit Profile
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
                            {(profilePicturePreview || false) &&
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
                            fullWidth
                            autoFocus
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            id="lastName"
                            autoComplete="family-name"
                            name="lastName"
                            label="Last Name"
                            fullWidth
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            id="email"
                            autoComplete="email"
                            name="email"
                            label="Email Address"
                            fullWidth
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            id="currentPassword"
                            autoComplete="new-password"
                            name="currentPassword"
                            label="Current Password"
                            fullWidth
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            type={showCurrentPassword ? 'text' : 'password'}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position={"end"}>
                                        <IconButton
                                            size="small"
                                            onClick={handleClickShowCurrentPassword}
                                        >
                                            {showCurrentPassword ? (
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
                        <TextField
                            id="newPassword"
                            autoComplete="new-password"
                            name="newPassword"
                            label="New Password"
                            fullWidth
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            type={showNewPassword ? 'text' : 'password'}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position={"end"}>
                                        <IconButton
                                            size="small"
                                            onClick={handleClickShowNewPassword}
                                        >
                                            {showNewPassword ? (
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
                            Save Changes
                        </Button>
                    </Grid>
                </Grid>
            </Box>
        </Container>
    );
}