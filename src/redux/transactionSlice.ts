// userSlice.ts
import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {
    getAdminTransactions,
    getClientAccounts,
    GetTransactionRequest,
    getTransactions,
    getUserTransactions
} from '../Backend';
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
    memo: string | null,
    admin_approved: boolean,
    authorized_date: string,
    alias?: string
}

interface TransactionState {
    transactions: Transaction[],
    adminTransactions: Transaction[],
    count: number,
    adminCount: number,
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: TransactionState = {
    transactions: [],
    adminTransactions: [],
    count: 0,
    adminCount: 0,
    status: 'idle',
    error: null,
};


export const fetchTransactions = createAsyncThunk('transactions/fetchTransactions', async (request: GetTransactionRequest) => {
    return await getTransactions(request)
});

export const fetchAndClearTransactions = createAsyncThunk('transactions/fetchAndClearTransactions', async (request: GetTransactionRequest) => {
    return await getTransactions(request)
});

export const fetchAdminTransactions = createAsyncThunk('transactions/fetchAdminTransactions', async (request: GetTransactionRequest) => {
    return await getTransactions(request)
});

export const fetchAndClearAdminTransactions = createAsyncThunk('transactions/fetchAndClearAdminTransactions', async (request: GetTransactionRequest) => {
    return await getTransactions(request)
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
                state.transactions = state.transactions.concat(action.payload.transactions)
                state.count = action.payload.count
                state.error = null;
            })
            .addCase(fetchTransactions.rejected, (state, action) => {
                state.status = 'failed';
                state.transactions = [];
                state.count = 0
                state.error = action.error.message || null;
            })
            .addCase(fetchAndClearTransactions.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchAndClearTransactions.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.transactions = action.payload.transactions;
                state.count = action.payload.count
                state.error = null;
            })
            .addCase(fetchAndClearTransactions.rejected, (state, action) => {
                state.status = 'failed';
                state.transactions = [];
                state.count = 0
                state.error = action.error.message || null;
            })
            .addCase(fetchAdminTransactions.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchAdminTransactions.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.adminTransactions = state.adminTransactions.concat(action.payload.transactions)
                state.adminCount = action.payload.count
                state.error = null;
            })
            .addCase(fetchAdminTransactions.rejected, (state, action) => {
                state.status = 'failed';
                state.adminTransactions = [];
                state.adminCount = 0
                state.error = action.error.message || null;
            })
            .addCase(fetchAndClearAdminTransactions.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchAndClearAdminTransactions.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.adminTransactions = action.payload.transactions;
                state.adminCount = action.payload.count
                state.error = null;
            })
            .addCase(fetchAndClearAdminTransactions.rejected, (state, action) => {
                state.status = 'failed';
                state.adminTransactions = [];
                state.adminCount = 0
                state.error = action.error.message || null;
            });

    }
});

export default transactionSlice.reducer;
export const selectTransactions = (state: RootState): Transaction[] => state.transaction.transactions
export const selectAdminTransactions = (state: RootState): Transaction[] => state.transaction.adminTransactions
export const selectCount = (state: RootState): number => state.transaction.count
export const selectAdminCount = (state: RootState): number => state.transaction.adminCount

