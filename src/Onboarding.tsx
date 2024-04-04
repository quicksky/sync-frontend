import React, {useState} from 'react';
import {resetUserPassword, validPassword} from "./Backend";
import {Button, Container, TextField, Typography} from "@mui/material";
import Box from "@mui/material/Box";
import {useNavigate} from "react-router-dom";

const Onboarding: React.FC = () => {
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
                <Typography variant="h4" color="primary">Create Password</Typography>
                <TextField
                    focused
                    type="password"
                    label="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    margin="normal"
                    fullWidth
                    sx={{input: {color: '#FFFFFF'}}}
                />
                <TextField
                    focused
                    type="password"
                    label="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    margin="normal"
                    fullWidth
                    sx={{input: {color: '#FFFFFF'}}}
                />
                <Button variant="contained" color="primary" onClick={handleSubmit}>
                    Submit
                </Button>
                {error ? <Typography color={"white"}>{errorText}</Typography> : undefined}
            </Box>
        </Container>
    )

};

export default Onboarding;