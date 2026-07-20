import React, {useEffect, useState} from 'react';
import {Button, TextField, Typography, Paper} from '@mui/material';
import {useNavigate} from 'react-router-dom';
import {loginUser} from "./redux/userSlice";
import {useAppDispatch} from "./redux/store";
import Box from "@mui/material/Box";
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
        <Box sx={{
            minHeight: '100vh',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'radial-gradient(circle at 20% 20%, #EEF3FC 0%, #F4F6F9 45%, #F4F6F9 100%)',
            px: 2,
        }}>
            <Paper elevation={1} sx={{
                width: '100%',
                maxWidth: 400,
                p: {xs: 3, sm: 5},
                borderRadius: 4,
            }}>
                <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 1}}>
                    <Box component="img" src="/logo192.png" alt="Sync"
                         sx={{width: 56, height: 56, borderRadius: '14px', mb: 2}}/>
                    <Typography component="h1" variant="h5" fontWeight={700}>
                        Welcome back
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{mt: 0.5}}>
                        Sign in to your Sync account
                    </Typography>
                </Box>
                {error && (
                    <Typography color="error" variant="body2" textAlign="center" sx={{mt: 2}}>
                        {errorText}
                    </Typography>
                )}
                <Box sx={{mt: 3}}>
                    <TextField
                        margin="normal"
                        error={error}
                        fullWidth
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        label="Email"
                        autoCapitalize={'none'}
                    />
                    <TextField
                        margin="normal"
                        error={error}
                        fullWidth
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        label="Password"
                    />
                    <Button
                        onClick={handleLogin}
                        fullWidth
                        variant="contained"
                        color="secondary"
                        size="large"
                        sx={{mt: 3, mb: 1}}
                    >
                        Sign In
                    </Button>
                    <Box sx={{display: 'flex', justifyContent: 'center', mt: 1}}>
                        <Button size="small" onClick={() => navigate('/forgotPassword')}>
                            Forgot password?
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </Box>
    )
}
export default LoginPage
