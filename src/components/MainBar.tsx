import * as React from 'react';
import {useNavigate} from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import EditIcon from "@mui/icons-material/Edit";
import {useUserStore} from "../store";
import {Popover, Stack} from "@mui/material";
import axios from "axios";
import Grid from "@mui/material/Grid";
const MainBar = () => {
    const navigate = useNavigate();
    const userState = useUserStore();

    const [user, setUser] = React.useState<User | null>(null);
    const [anchorElNav, setAnchorElNav] = React.useState<HTMLElement | null>(null);
    const [anchorElProfile, setAnchorElProfile] = React.useState<HTMLElement | null>(null);

    React.useEffect(() => {
        if (userState.token) {
            getUser();
        } else {
            setUser(null);
        }
    }, [userState]);

    const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElNav(event.currentTarget);
    };
    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };
    const handleOpenProfileMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElProfile(event.currentTarget);
    };
    const handleCloseProfileMenu = () => {
        setAnchorElProfile(null);
    };

    const handleExploreClick = () => {
        navigate(`/`)
    }

    const handleMyPetitionsClick = () => {
        navigate(`/my-petitions`)
    }

    const handleLoginClick = () => {
        navigate(`/login`)
    }

    const handleRegisterClick = () => {
        navigate(`/register`)
    }

    const handleEditProfileClick = () => {
        navigate(`/edit-profile`)
    }

    const handleLogoutClick = () => {
        logoutUser();
    }

    const getUser = () => {
        axios.get(`https://seng365.csse.canterbury.ac.nz/api/v1/users/${userState.id}`, {headers: {
                "X-Authorization": userState.token}
        })
            .then((response) => {
                setUser(response.data)
            })
            .catch((error) => {
                console.log(error)
            });
    };

    const logoutUser = () => {
        axios.post('https://seng365.csse.canterbury.ac.nz/api/v1/users/logout', null, {headers: {
                "X-Authorization": userState.token}
        })
            .then((response) => {
                userState.removeId();
                userState.removeToken();
                navigate(`/`)
            })
            .catch((error) => {
                console.log(error);
            });
    };

    return (
        <AppBar position="static">
            <Container maxWidth="xl">
                <Toolbar disableGutters>
                    <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
                        <IconButton
                            size="large"
                            aria-controls="main-drawer"
                            aria-haspopup="true"
                            onClick={handleOpenNavMenu}
                            color="inherit"
                        >
                            <MenuIcon/>
                        </IconButton>

                        <Menu
                            id="main-drawer"
                            keepMounted
                            anchorEl={anchorElNav}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'left',
                            }}
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'left',
                            }}
                            open={Boolean(anchorElNav)}
                            onClose={handleCloseNavMenu}
                        >
                            <MenuItem onClick={() => {handleExploreClick(); handleCloseNavMenu();}}>
                                <Typography variant={'button'} >
                                    Explore
                                </Typography>
                            </MenuItem>
                            {userState.token &&
                                (
                                    <MenuItem onClick={() => {handleMyPetitionsClick(); handleCloseNavMenu();}}>
                                        <Typography variant={'button'}>
                                            My Petitions
                                        </Typography>
                                    </MenuItem>
                                )
                            }
                            {!userState.token &&
                                (
                                    <MenuItem onClick={() => {handleLoginClick(); handleCloseNavMenu();}}>
                                        <Typography variant={'button'}>
                                            Login
                                        </Typography>
                                    </MenuItem>
                                )
                            }
                            {!userState.token &&
                                (
                                    <MenuItem onClick={() => {handleRegisterClick(); handleCloseNavMenu();}}>
                                        <Typography variant={'button'}>
                                            Register
                                        </Typography>
                                    </MenuItem>
                                )
                            }
                        </Menu>
                    </Box>

                    <Box
                        component="img"
                        sx={{
                            width: 128,
                            objectFit: 'cover',
                            mr: { xs: 'auto', md: 2 }
                        }}
                        src="/logo.png"
                    />
                    <Box sx={{ mr: 'auto', display: { xs: 'none', md: 'flex' }}}>
                        <Button
                            onClick={handleExploreClick}
                            sx={{ my: 2, color: 'white', display: 'block' }}
                        >
                            Explore
                        </Button>
                        {userState.token &&
                            (
                                <Button
                                    onClick={handleMyPetitionsClick}
                                    sx={{ my: 2, color: 'white', display: 'block' }}
                                >
                                    My Petitions
                                </Button>
                            )
                        }
                    </Box>

                    {userState.token ?
                        (
                            <Box>
                                <Tooltip title="My Profile">
                                    <IconButton sx={{ p: 0, ml: 2}}
                                                onClick={handleOpenProfileMenu}
                                    >
                                        <Avatar src={`https://seng365.csse.canterbury.ac.nz/api/v1/users/${userState.id}/image`} />
                                    </IconButton>
                                </Tooltip>

                                <Popover
                                    id="profile-drawer"
                                    keepMounted
                                    anchorEl={anchorElProfile}
                                    anchorOrigin={{
                                        vertical: 'bottom',
                                        horizontal: 'right',
                                    }}
                                    transformOrigin={{
                                        vertical: 'top',
                                        horizontal: 'right',
                                    }}
                                    open={Boolean(anchorElProfile)}
                                    onClose={handleCloseProfileMenu}
                                >
                                    <Grid container textAlign={"center"} spacing={1} p={2} >
                                        <Grid item xs={12} sx={{display: 'flex', justifyContent: 'center'}}>
                                            <Avatar src={`https://seng365.csse.canterbury.ac.nz/api/v1/users/${userState.id}/image`} sx={{width: 64, height: 64}}/>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Typography variant="subtitle1" sx={{overflowWrap: 'break-word'}}>
                                                {user?.firstName} {user?.lastName}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Typography variant="body2" sx={{overflowWrap: 'break-word'}}>
                                                {user?.email}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Button
                                                onClick={() => {handleEditProfileClick(); handleCloseProfileMenu();}}
                                                startIcon={<EditIcon/>}
                                            >
                                                Edit
                                            </Button>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Button
                                                onClick={() => {handleLogoutClick(); handleCloseProfileMenu();}}
                                                startIcon={<LogoutIcon/>}
                                            >
                                                Logout
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </Popover>
                            </Box>
                        ) :
                        (
                            <Box sx={{display: { xs: 'none', md: 'flex' } }}>
                                <Button
                                    onClick={handleLoginClick}
                                    sx={{color: 'white', display: 'block' }}
                                >
                                    Login
                                </Button>
                                <Button
                                    onClick={handleRegisterClick}
                                    sx={{color: 'white', display: 'block' }}
                                >
                                    Register
                                </Button>
                            </Box>
                        )
                    }
                </Toolbar>
            </Container>
        </AppBar>
    );
}
export default MainBar;