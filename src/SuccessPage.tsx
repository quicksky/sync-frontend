import React, {useEffect, useState} from 'react';
import {
    Box,
    CircularProgress,
} from '@mui/material';

import {getUserTransactions, Transaction} from "./Backend";
import TransactionList from "./TransactionList";
import MainAppBar from "./MainAppBar";

const SuccessPage: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [, setError] = useState<boolean>(false)

    useEffect(() => {
        setIsLoading(true)
        getUserTransactions().then(r => setTransactions(r)).catch(() => setError(true)).finally(() => setIsLoading(false))
    }, []);


    return (
        <Box sx={{flexGrow: 1}}>
            <MainAppBar/>

            {isLoading ? (
                <CircularProgress/>
            ) : (
                <TransactionList transactions={transactions}/>
            )}

        </Box>
    );
};

export default SuccessPage;