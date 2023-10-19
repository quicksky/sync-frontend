import React, {useEffect, useState} from 'react';
import {Button, TextField, Container, Typography} from '@mui/material';
import {useNavigate} from 'react-router-dom';
import {fetchUser, loginUser} from "./redux/userSlice";
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
        <Container>
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
        </Container>
    );
};

export default LoginPage;
