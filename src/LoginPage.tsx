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
                borderRadius: 4,
                overflow: 'hidden',
            }}>
                <Box sx={{
                    background: 'linear-gradient(160deg, #1B2A47 0%, #0B1729 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    px: 3,
                    pt: 5,
                    pb: 4,
                }}>
                    <Box component="img" src="/logo512.png" alt="Sync"
                         sx={{
                             width: 150,
                             height: 150,
                             borderRadius: '24px',
                             boxShadow: '0 12px 28px rgba(11, 23, 41, 0.5)',
                         }}/>
                    <Typography component="h1" variant="h5" fontWeight={700} sx={{color: '#FFFFFF', mt: 3}}>
                        Sign in to Sync
                    </Typography>
                </Box>
                <Box sx={{p: {xs: 3, sm: 5}}}>
                    {error && (
                        <Typography color="error" variant="body2" textAlign="center" sx={{mb: 2}}>
                            {errorText}
                        </Typography>
                    )}
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
