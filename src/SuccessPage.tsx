import React, {useEffect, useState} from 'react';
import {
    Box,
} from '@mui/material';

import TransactionList from "./TransactionList";
import SyncLoadingSpinner from "./components/SyncLoadingSpinner";
import MainAppBar from "./MainAppBar";
import {useAppDispatch, useAppSelector} from "./redux/store";
import {fetchClientAccounts, fetchOwnAccounts, selectClientAccounts, selectOwnAccounts} from "./redux/accountSlice";
import {
    fetchAndClearAdminTransactions,
    fetchAndClearTransactions,
    fetchTransactions, selectAdminCount, selectAdminTransactions,
    selectCount,
    selectTransactions,
    Transaction
} from "./redux/transactionSlice";
import {selectIsAdmin, selectUser} from "./redux/userSlice";
import AdminTable from "./AdminTable";
import {fetchUserList} from "./redux/clientSlice";

const SuccessPage: React.FC = () => {
    const dispatch = useAppDispatch()
    const transactions = useAppSelector(selectTransactions)
    const adminTransactions = useAppSelector(selectAdminTransactions)
    const adminCount = useAppSelector(selectAdminCount)
    const isAdmin = useAppSelector(selectIsAdmin)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [, setError] = useState<boolean>(false)
    const accounts = useAppSelector(selectOwnAccounts)
    const user = useAppSelector(selectUser)
    const count = useAppSelector(selectCount);
    const adminAccounts = useAppSelector(selectClientAccounts)
    const adminViewState = useState<boolean>(false)

    useEffect(() => {
        setIsLoading(true)
        user && Promise.all([user && dispatch(fetchAndClearTransactions({
            limit: 50,
            offset: 0,
            filters: {user_card_number: user.card_number}
        })),
            user && isAdmin && dispatch(fetchAndClearAdminTransactions({
                limit: 50,
                offset: 0
            })),
            user && !isAdmin && dispatch(fetchOwnAccounts()),
            isAdmin && dispatch(fetchClientAccounts()), isAdmin && dispatch(fetchUserList())]).finally(() => setIsLoading(false))
    }, [user]);

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            minHeight: '100vh',
            pb: 4,
        }}>
            <MainAppBar adminViewState={adminViewState}/>

            {isLoading ? (
                    <SyncLoadingSpinner/>
                ) :
                adminViewState[0] ? (
                        <AdminTable transactions={adminTransactions} accounts={adminAccounts} count={adminCount}/>) :
                    (<TransactionList transactions={transactions} accounts={isAdmin ? adminAccounts : accounts}
                                      count={count}/>)

            }

        </Box>
    );
};

export default SuccessPage;
