import React, {useState} from 'react';
import {useAppDispatch} from "./redux/store";
import {resetUserPassword} from "./Backend";
import {Button, Container, TextField, Typography} from "@mui/material";

const Onboarding: React.FC = () => {
    const params = new URLSearchParams(document.location.search);
    const dispatch = useAppDispatch();
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [error, setError] = useState<boolean>(false)
    const [errorText, setErrorText] = useState<string>("");


    const token = params.get("token") || "";
    console.log(token)

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
        resetUserPassword(password, token).then(() => {
            console.log("success")
        }).catch((data) => {
            console.log(data)
        })
    }


    return (
        <Container>
            <Typography variant="h4">Create Password</Typography>
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
            <Button variant="contained" color="primary" onClick={handleSubmit}>
                Submit
            </Button>
            {error ? <Typography>{errorText}</Typography> : undefined}
        </Container>
    )

};

export default Onboarding;