import React, {useEffect, useState} from 'react';
import {
    Box,
    CircularProgress,
} from '@mui/material';

import TransactionList from "./TransactionList";
import MainAppBar from "./MainAppBar";
import {useAppDispatch, useAppSelector} from "./redux/store";
import {fetchUserAccounts, selectAccounts} from "./redux/accountSlice";
import {fetchTransactions, selectTransactions, Transaction} from "./redux/transactionSlice";
import {selectIsAdmin, selectUser} from "./redux/userSlice";

const SuccessPage: React.FC = () => {
    const dispatch = useAppDispatch()
    const transactions = useAppSelector(selectTransactions)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [, setError] = useState<boolean>(false)
    const accounts = useAppSelector(selectAccounts)
    const user = useAppSelector(selectUser)
    const isAdmin = useAppSelector(selectIsAdmin);

    useEffect(() => {
        setIsLoading(true)
        user && dispatch(fetchTransactions(isAdmin)).finally(() => {
            setIsLoading(false)
        })
        dispatch(fetchUserAccounts())

    }, [dispatch, user]);

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
        }}>
            <MainAppBar/>

            {isLoading ? (
                <CircularProgress/>
            ) : (
                <TransactionList transactions={transactions} accounts={accounts} isAdmin={isAdmin}/>
            )}

        </Box>
    );
};

export default SuccessPage;
