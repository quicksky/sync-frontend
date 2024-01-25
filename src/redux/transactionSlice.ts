// userSlice.ts
import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {getAdminTransactions, getClientAccounts, getUserTransactions} from '../Backend';
import {RootState} from "./store";


export interface Transaction {
    transaction_id: string;
    client_id: number,
    account_id: string,
    account_owner: string,
    date: string;
    name: string;
    pending: boolean,
    amount: number,
    receipt_key: number | null
    internal_account: number | null,
    memo: string | null

}

interface TransactionState {
    transactions: Transaction[],
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: TransactionState = {
    transactions: [],
    status: 'idle',
    error: null,
};


export const fetchTransactions = createAsyncThunk('transactions/fetchTransactions', async (isAdmin: boolean) => {
    return isAdmin ? await getAdminTransactions() : await getUserTransactions()
});

const transactionSlice = createSlice({
    name: 'transaction',
    initialState,
    reducers: {},
    extraReducers: builder => {
        builder
            .addCase(fetchTransactions.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchTransactions.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.transactions = action.payload;
                state.error = null;
            })
            .addCase(fetchTransactions.rejected, (state, action) => {
                state.status = 'failed';
                state.transactions = [];
                state.error = action.error.message || null;
            });
    }
});

export default transactionSlice.reducer;
export const selectTransactions = (state: RootState): Transaction[] => state.transaction.transactions

