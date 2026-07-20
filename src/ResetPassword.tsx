import React, {useState} from 'react';
import {resetUserPassword, validPassword} from "./Backend";
import {Button, TextField, Typography, Paper} from "@mui/material";
import Box from "@mui/material/Box";
import {useNavigate} from "react-router-dom";

const ResetPassword: React.FC = () => {
    const params = new URLSearchParams(document.location.search);
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [error, setError] = useState<boolean>(false)
    const [errorText, setErrorText] = useState<string>("");


    const token = params.get("token") || "";
    const navigate = useNavigate();

    const handleSubmit = () => {
        if (token === "") {
            setError(true)
            setErrorText("Empty token")
            return
        }
        if (password !== confirmPassword) {
            setError(true)
            setErrorText("Passwords do not match")
            return
        }
        if (!validPassword(password)) {
            setError(true)
            setErrorText("Password must be at least 8 characters long, contain a capital letter, a number, and a symbol.")
            return
        }
        resetUserPassword(password, token).then(() => {
            navigate('/')
        }).catch((data) => {
            setError(true)
            setErrorText("Error communicating with server")
        })
    }


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
            <Paper elevation={1} sx={{width: '100%', maxWidth: 400, p: {xs: 3, sm: 5}, borderRadius: 4}}>
                <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                    <Typography variant="h5" fontWeight={700}>Reset Password</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{mt: 0.5, mb: 3}}>
                        Choose a new password for your account
                    </Typography>
                    <TextField
                        type="password"
                        label="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        margin="normal"
                        fullWidth
                    />
                    <TextField
                        type="password"
                        label="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        margin="normal"
                        fullWidth
                    />
                    {error ? <Typography color="error" variant="body2" sx={{mt: 1, mb: 1}}>{errorText}</Typography> : undefined}
                    <Button variant="contained" color="secondary" size="large" fullWidth
                            onClick={handleSubmit} sx={{mt: 2}}>
                        Submit
                    </Button>
                </Box>
            </Paper>
        </Box>
    )

};

export default ResetPassword;