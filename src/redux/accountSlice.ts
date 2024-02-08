// userSlice.ts
import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {getClientAccounts, getOwnAccounts, getUserAccounts} from '../Backend';
import {RootState} from "./store";


export interface Account {
    id: number,
    name: string
}

interface AccountState {
    ownAccounts: Account[]
    clientAccounts: Account[]
    userAccounts: Account[]
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: AccountState = {
    ownAccounts: [],
    clientAccounts: [],
    userAccounts: [],
    status: 'idle',
    error: null,
};


export const fetchOwnAccounts = createAsyncThunk('client/fetchOwnAccounts', async () => {
    return await getOwnAccounts();
});
export const fetchClientAccounts = createAsyncThunk('client/fetchClientAccounts', async () => {
    return await getClientAccounts();
});

export const fetchUserAccounts = createAsyncThunk('client/fetchUserAccounts', async (user_id: string) => {
    return await getUserAccounts({user_id: user_id});
});

const accountSlice = createSlice({
    name: 'account',
    initialState,
    reducers: {},
    extraReducers: builder => {
        builder
            .addCase(fetchClientAccounts.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchClientAccounts.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.clientAccounts = action.payload;
                state.error = null;
            })
            .addCase(fetchClientAccounts.rejected, (state, action) => {
                state.status = 'failed';
                state.clientAccounts = [];
                state.error = action.error.message || null;
            })
            .addCase(fetchOwnAccounts.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchOwnAccounts.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.ownAccounts = action.payload;
                state.error = null;
            })
            .addCase(fetchOwnAccounts.rejected, (state, action) => {
                state.status = 'failed';
                state.ownAccounts = [];
                state.error = action.error.message || null;
            })
            .addCase(fetchUserAccounts.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchUserAccounts.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.userAccounts = action.payload;
                state.error = null;
            })
            .addCase(fetchUserAccounts.rejected, (state, action) => {
                state.status = 'failed';
                state.userAccounts = [];
                state.error = action.error.message || null;
            });

    }
});

export default accountSlice.reducer;
export const selectOwnAccounts = (state: RootState): Account[] => state.accounts.ownAccounts;
export const selectClientAccounts = (state: RootState): Account[] => state.accounts.clientAccounts
export const selectUserAccounts = (state: RootState): Account[] => state.accounts.userAccounts
export const selectAccountState = (state: RootState): AccountState => state.accounts;

