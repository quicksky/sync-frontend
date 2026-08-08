import React, {useState} from 'react';
import {resetUserPassword, validPassword} from "./Backend";
import {Button, TextField} from "@mui/material";
import {useNavigate} from "react-router-dom";
import AuthShell from "./components/AuthShell";

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
        <AuthShell title="Create Password" subtitle="Set a password to finish setting up your account"
                   error={error ? errorText : undefined}>
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
            <Button variant="contained" color="secondary" size="large" fullWidth
                    onClick={handleSubmit} sx={{mt: 2}}>
                Submit
            </Button>
        </AuthShell>
    )

};

export default Onboarding;
