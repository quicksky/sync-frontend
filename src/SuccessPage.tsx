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
import {useMediaQuery} from "react-responsive";

const SuccessPage: React.FC = () => {
    const dispatch = useAppDispatch()
    const isMobile = useMediaQuery({maxWidth: 600})
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
            alignItems: 'center',
            width: '100%',
            pb: 4,
            // On desktop the table panel owns its scrolling, so the page itself is
            // pinned to the viewport. Mobile keeps ordinary page scroll.
            ...(isMobile
                ? {justifyContent: 'center', minHeight: '100vh'}
                : {height: '100vh', overflow: 'hidden'}),
        }}>
            <MainAppBar adminViewState={adminViewState}/>

            <Box sx={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                // Desktop: absorb the space below the app bar so the table can size
                // itself against the viewport instead of the document.
                ...(isMobile ? {} : {flex: 1, minHeight: 0}),
                ...(isLoading ? {justifyContent: 'center'} : {}),
            }}>
                {isLoading ? (
                        <SyncLoadingSpinner/>
                    ) :
                    adminViewState[0] ? (
                            <AdminTable transactions={adminTransactions} accounts={adminAccounts}
                                        count={adminCount}/>) :
                        (<TransactionList transactions={transactions} accounts={isAdmin ? adminAccounts : accounts}
                                          count={count}/>)

                }
            </Box>

        </Box>
    );
};

export default SuccessPage;
