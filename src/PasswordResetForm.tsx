import React, {useState} from 'react';
import {initiatePasswordReset, resetUserPassword} from "./Backend";
import {Button, TextField, Typography, Paper} from "@mui/material";
import Box from "@mui/material/Box";
import {useNavigate} from "react-router-dom";

const PasswordResetForm: React.FC = () => {
    const [email, setEmail] = useState<string>("");
    const [error, setError] = useState<boolean>(false)
    const [errorText, setErrorText] = useState<string>("");


    const navigate = useNavigate();

    const handleSubmit = () => {
        initiatePasswordReset(email).then(() => {
            navigate('/')
        }).catch((data) => {
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
                    <Typography variant="h5" fontWeight={700}>Forgot your password?</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{mt: 0.5, mb: 3}} textAlign="center">
                        Enter your email and we'll send you a reset link
                    </Typography>
                    <TextField
                        label="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
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

export default PasswordResetForm;