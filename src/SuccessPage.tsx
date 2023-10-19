import React, {useEffect, useState} from 'react';
import {Container, Typography} from '@mui/material';
import {RootState, useAppDispatch} from "./redux/store";
import {useDispatch, useSelector} from "react-redux";
import {fetchUser, selectUser} from "./redux/userSlice";


const SuccessPage: React.FC = () => {
    const dispatch = useAppDispatch();

    const user = useSelector(selectUser)


    useEffect(() => {
        dispatch(fetchUser())
    }, [])

    return (
        <Container>
            <Typography variant="h4">Login Successful!</Typography>
            <Typography variant="body1">Welcome back, {user ? user.first_name : "not found"}</Typography>
        </Container>
    );
};

export default SuccessPage;
