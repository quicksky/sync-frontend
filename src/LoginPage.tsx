import React, {useEffect, useState} from 'react';
import {Button, TextField, Container, Typography, Grid} from '@mui/material';
import {useNavigate} from 'react-router-dom';
import {loginUser} from "./redux/userSlice";
import {useAppDispatch} from "./redux/store";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import {getUserApi} from "./Backend";

const LoginPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const [error, setError] = useState<boolean>(false);
    const [errorText, setErrorText] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    const navigate = useNavigate();

    useEffect(() => {
        getUserApi().then(() => {
            navigate("/home")
        }).catch(() => {
        })
    }, [dispatch])

    const handleLogin = () => {
        dispatch(loginUser({email: email.toLowerCase(), password: password})).unwrap().then(() => {
            setError(false)
            navigate("/home")
        }).catch(e => {
            setError(true)
            setErrorText(e.code === "ERR_BAD_REQUEST" ? "Invalid Email or Password" : "Server Error");
        })
    };

    return (
        <Container component="main" maxWidth="xs" sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            height: '80vh'
        }}>
            <CssBaseline/>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                }}
            >
                <Avatar sx={{m: 1, bgcolor: '#FFFFFF'}}>
                    <LockOutlinedIcon/>
                </Avatar>
                <Typography component="h1" variant="h5" color={error ? 'error' : 'primary'}>
                    {error ? errorText : "Sign in"}
                </Typography>
                <Box sx={{mt: 1}}>
                    <TextField
                        margin="normal"
                        focused
                        error={error}
                        fullWidth
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        label="Email"
                        autoCapitalize={'none'}
                        sx={{input: {color: '#FFFFFF'}}}
                    />
                    <TextField
                        margin="normal"
                        focused
                        error={error}
                        fullWidth
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        label="Password"
                        sx={{input: {color: '#FFFFFF'}}}
                    />
                    <Button
                        onClick={handleLogin}
                        fullWidth
                        variant="contained"
                        sx={{mt: 2, mb: 1}}
                    >
                        Sign In
                    </Button>
                    <Grid container justifyContent={"right"}>
                        <Button onClick={() => navigate('/forgotPassword')}>Forgot
                            Password</Button>
                    </Grid>
                </Box>
            </Box>
        </Container>
    )
}
export default LoginPage
