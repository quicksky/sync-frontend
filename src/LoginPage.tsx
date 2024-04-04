import React, {useEffect, useState} from 'react';
import {Button, TextField, Container, Typography, Grid} from '@mui/material';
import {useNavigate} from 'react-router-dom';
import {loginUser} from "./redux/userSlice";
import {useAppDispatch} from "./redux/store";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import {getUserApi} from "./Backend";

const LoginPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const [error, setError] = useState<boolean>(false);
    const [errorText, setErrorText] = useState<string>("");
    //error text

    const navigate = useNavigate();

    //try to login

    useEffect(() => {
        getUserApi().then(() => {
            navigate("/home")
        }).catch(() => {
        })
    }, [dispatch])

    const handleLogin = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const formJson = Object.fromEntries((formData as any).entries());
        const email = formJson.email;
        const password = formJson.password;
        setError(false)
        dispatch(loginUser({email: email, password: password})).unwrap().then(() => {
            navigate("/home")
        }).catch(e => {
            setError(true)
            setErrorText(e.code === "ERR_BAD_REQUEST" ? "Invalid Email or Password" : "There was an error communicating with the server");
        })
    };

    return (
        <Container component="main" maxWidth="xs" sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            height: '80vh'
        }}>
            <CssBaseline/>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                }}
            >
                <Avatar sx={{m: 1, bgcolor: '#FFFFFF'}}>
                    <LockOutlinedIcon/>
                </Avatar>
                <Typography component="h1" variant="h5" color='primary'>
                    Sign in
                </Typography>
                <Box component="form" onSubmit={handleLogin} noValidate sx={{mt: 1}}>
                    <TextField
                        margin="normal"
                        focused
                        fullWidth
                        id="email"
                        name="email"
                        label="Email"
                        sx={{input: {color: '#FFFFFF'}}}
                    />
                    <TextField
                        margin="normal"
                        focused
                        fullWidth
                        id="password"
                        type="password"
                        name="password"
                        label="Password"
                        sx={{input: {color: '#FFFFFF'}}}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{mt: 2, mb: 1}}
                    >
                        Sign In
                    </Button>
                    {/*<Grid container>*/}
                    {/*    <Grid item xs>*/}
                    {/*        <Link href="#" variant="body2">*/}
                    {/*            Forgot password?*/}
                    {/*        </Link>*/}
                    {/*    </Grid>*/}
                    {/*</Grid>*/}
                    {error ? (<Typography color={"white"}>{errorText}</Typography>) : undefined}
                    <Grid container justifyContent={"right"}>
                        <Button onClick={() => navigate('/forgotPassword')}>Forgot
                            Password</Button>
                    </Grid>
                </Box>
            </Box>
        </Container>
    )
}
export default LoginPage
