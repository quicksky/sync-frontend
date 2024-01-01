import React, {useEffect, useState} from 'react';
import {Box, CircularProgress, Container, Typography} from '@mui/material';


//import TransactionList from './TransactionList';
import {getUserTransactions, Transaction} from "./Backend";

const SuccessPage: React.FC = () => {
    const [, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [, setError] = useState<boolean>(false)

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
                // <TransactionList transactions={transactions}/>
                undefined
            )}
        </Box>
    );
};

export default SuccessPage;