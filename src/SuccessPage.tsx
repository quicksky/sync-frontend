import React, {useEffect, useState} from 'react';
import {Box, CircularProgress, Container, Typography} from '@mui/material';
import {RootState, useAppDispatch} from "./redux/store";
import {useDispatch, useSelector} from "react-redux";
import {fetchUser, selectUser} from "./redux/userSlice";


import TransactionList from './TransactionList';
import {getUserTransactions, Transaction} from "./Backend";

const SuccessPage: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [error, setError] = useState<boolean>(false)

    useEffect(() => {
        // Fetch transactions from the backend
        // Example: axios.get('/api/transactions').then(response => setTransactions(response.data))
        setIsLoading(true)
        getUserTransactions().then(r => setTransactions(r)).catch(() => setError(true)).finally(() => setIsLoading(false))
    }, []);


    return (
        <Box style={{padding: '30px'}}>
            <Typography variant="h4" style={{marginBottom: '30px'}}>
                My Transactions
            </Typography>
            {isLoading ? (
                <CircularProgress/>
            ) : (
                <TransactionList transactions={transactions}/>
            )}
        </Box>
    );
};

export default SuccessPage;