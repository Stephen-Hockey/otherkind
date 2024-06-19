import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import {Chip, InputAdornment, Snackbar, Stack} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import {Error, Visibility, VisibilityOff, Warning} from "@mui/icons-material";
import axios from "axios";
import {useNavigate} from "react-router-dom";
import {useUserStore} from "../store";
import ErrorIcon from '@mui/icons-material/Error';

export default function LoginPage() {
    const navigate = useNavigate();
    const userState = useUserStore();

    const [submittable, setSubmittable] = React.useState<boolean>(false);

    const [email, setEmail] = React.useState<string>("");
    const [password, setPassword] = React.useState<string>("");
    const [showPassword, setShowPassword] = React.useState<boolean>(false);

    const [errorMessage, setErrorMessage] = React.useState<string>("");

    React.useEffect(() => {
        if (userState.token) {
            navigate(`/`);
        }
    }, []);

    React.useEffect(() => {
        if (submittable) {
            setSubmittable(false);
            authorizeUser();
        }
    }, [submittable]);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setEmail(data.get("email") as string);
        setPassword(data.get("password") as string);
        setSubmittable(true);
    };

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const authorizeUser = () => {
        const body = {
            email: email,
            password: password
        }
        axios.post('https://seng365.csse.canterbury.ac.nz/api/v1/users/login', body)
            .then((response) => {
                setErrorMessage("");
                userState.setId(response.data.userId.toString());
                userState.setToken(response.data.token);
                navigate('/')
            })
            .catch((error) => {
                const status = error.response.status;
                const statusText: string = error.response.statusText;
                if (status === 401) {
                    setErrorMessage("Incorrect email or password")
                } else if (statusText.includes("email must match format")) {
                    setErrorMessage("Email must be of the form 'adam@example.com'");
                } else if (statusText.includes("email")) {
                    setErrorMessage("Email must be between 1 and 256 characters long");
                } else if (statusText.includes("password")) {
                    setErrorMessage("Password must be between 6 and 64 characters long")
                }
            });
    };

    return (
        <Container component="main" maxWidth="xs">
            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }} >
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
                            Login
                        </Typography>
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
                            Log In
                        </Button>
                    </Grid>
                    <Grid item xs={12}>
                        <Link onClick={() => navigate("/register")} variant="body2" sx={{cursor: 'pointer'}}>
                            Don't have an account? Register here
                        </Link>
                    </Grid>
                </Grid>
            </Box>
        </Container>
    );
}