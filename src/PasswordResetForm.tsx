import React, {useState} from 'react';
import {initiatePasswordReset, resetUserPassword} from "./Backend";
import {Button, Container, TextField, Typography} from "@mui/material";
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
        <Container component="main" maxWidth="xs" sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            height: '80vh'
        }}>
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                alignItems: 'center',
            }}>
                <Typography variant="h4" color="primary">Enter your Email</Typography>
                <TextField
                    focused
                    label="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    margin="normal"
                    fullWidth
                    sx={{input: {color: '#FFFFFF'}}}
                />
                <Button variant="contained" color="primary" onClick={handleSubmit}>
                    Submit
                </Button>
                {error ? <Typography>{errorText}</Typography> : undefined}
            </Box>
        </Container>
    )

};

export default PasswordResetForm;