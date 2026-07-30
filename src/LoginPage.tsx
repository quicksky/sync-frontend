import React, {useEffect, useState} from 'react';
import {Button, TextField} from '@mui/material';
import {useNavigate} from 'react-router-dom';
import {loginUser} from "./redux/userSlice";
import {useAppDispatch} from "./redux/store";
import Box from "@mui/material/Box";
import {getUserApi} from "./Backend";
import AuthShell from "./components/AuthShell";

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
        <AuthShell title="Sign in to Sync" variant="brand" error={error ? errorText : undefined}>
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
        </AuthShell>
    )
}
export default LoginPage
