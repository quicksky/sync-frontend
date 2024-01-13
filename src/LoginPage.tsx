import React, {useEffect, useState} from 'react';
import {Button, TextField, Container, Typography, Paper} from '@mui/material';
import {useNavigate} from 'react-router-dom';
import {loginUser} from "./redux/userSlice";
import {useAppDispatch} from "./redux/store";

const LoginPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const navigate = useNavigate();

    const handleLogin = () => {
        dispatch(loginUser({email: username, password: password})).unwrap().then(() => {
            navigate("/success")
        }).catch(() => {
            alert("Invaliud")
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
            }}>
                <Typography variant="h4">Login</Typography>
                <TextField
                    label="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    margin="normal"
                    fullWidth
                />
                <TextField
                    type="password"
                    label="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    margin="normal"
                    fullWidth
                />
                <Button variant="contained" color="primary" onClick={handleLogin}>
                    Login
                </Button>
            </Paper>
        </Container>
    );
};

export default LoginPage;
