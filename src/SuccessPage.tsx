import React, {useEffect, useState} from 'react';
import {
    Box,
    CircularProgress,
} from '@mui/material';

import TransactionList from "./TransactionList";
import MainAppBar from "./MainAppBar";
import {useAppDispatch, useAppSelector} from "./redux/store";
import {fetchOwnAccounts, selectOwnAccounts} from "./redux/accountSlice";
import {
    fetchAndClearTransactions,
    fetchTransactions,
    selectCount,
    selectTransactions,
    Transaction
} from "./redux/transactionSlice";
import {selectIsAdmin, selectUser} from "./redux/userSlice";
import AdminTable from "./AdminTable";

const SuccessPage: React.FC = () => {
    const dispatch = useAppDispatch()
    const transactions = useAppSelector(selectTransactions)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [, setError] = useState<boolean>(false)
    const accounts = useAppSelector(selectOwnAccounts)
    const user = useAppSelector(selectUser)
    const count = useAppSelector(selectCount);
    const adminViewState = useState<boolean>(false)

    useEffect(() => {
        setIsLoading(true)
        user && dispatch(fetchAndClearTransactions({
            limit: 50,
            offset: 0,

        })).finally(() => {
            console.log("was called")
            setIsLoading(false)
        })
        dispatch(fetchOwnAccounts())

    }, [dispatch, user]);

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
        }}>
            <MainAppBar adminViewState={adminViewState}/>

            {isLoading ? (
                    <CircularProgress/>
                ) :
                adminViewState[0] ? (<AdminTable transactions={transactions} accounts={accounts} count={count}/>) :
                    (<TransactionList transactions={transactions} accounts={accounts} count={count}/>)

            }

        </Box>
    );
};

export default SuccessPage;
