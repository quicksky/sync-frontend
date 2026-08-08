import React, {useState} from 'react';
import {initiatePasswordReset} from "./Backend";
import {Button, TextField} from "@mui/material";
import {useNavigate} from "react-router-dom";
import AuthShell from "./components/AuthShell";

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
        <AuthShell title="Forgot your password?" subtitle="Enter your email and we'll send you a reset link"
                   error={error ? errorText : undefined}>
            <TextField
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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

export default PasswordResetForm;
