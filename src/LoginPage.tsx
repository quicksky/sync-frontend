import React, {useState} from 'react';
import {Button, TextField, Container, Typography, Paper, Alert} from '@mui/material';
import {useNavigate} from 'react-router-dom';
import {loginUser} from "./redux/userSlice";
import {useAppDispatch} from "./redux/store";

const LoginPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<boolean>(false);

    const navigate = useNavigate();

    const handleLogin = () => {
        setError(false)
        dispatch(loginUser({email: username, password: password})).unwrap().then(() => {
            navigate("/success")
        }).catch((r) => {
            setError(true)
        })
    };

    return (
        <Container style={{
            display: 'flex',
            height: '100vh', // Full viewport height
            alignItems: 'center', // Vertical centering
            justifyContent: 'center', // Horizontal centering
        }}>
            <Paper style={{
                backgroundColor: '#ffffff',
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center",
                verticalAlign: "middle",
                boxShadow: "4px 4px 4px rgba(0, 0, 0, 0.25)",
                borderRadius: "25px",
                padding: '20px',
                display: 'flex',
                flexDirection: "column",
                width: "35%"
            }}>
                <Typography variant="h4">Sync</Typography>
                <TextField
                    label="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    margin="normal"
                    fullWidth
                    sx={{mb: 2}}
                />
                <TextField
                    type="password"
                    label="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    margin="normal"
                    fullWidth

                />
                {error ? (<Alert severity="error">Incorrect email or password</Alert>) : undefined}
                <Button variant="contained" color="primary" onClick={handleLogin}>
                    Login
                </Button>
            </Paper>
        </Container>
    );
};

export default LoginPage;
