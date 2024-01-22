// userSlice.ts
import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {getClientAccounts} from '../Backend';
import {RootState} from "./store";


export interface Account {
    id: number,
    name: string
}

interface AccountState {
    accounts: Account[]
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: AccountState = {
    accounts: [],
    status: 'idle',
    error: null,
};


export const fetchUserAccounts = createAsyncThunk('client/fetchAccount', async () => {
    return await getClientAccounts();
});

const accountSlice = createSlice({
    name: 'account',
    initialState,
    reducers: {},
    extraReducers: builder => {
        builder
            .addCase(fetchUserAccounts.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchUserAccounts.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.accounts = action.payload;
                state.error = null;
            })
            .addCase(fetchUserAccounts.rejected, (state, action) => {
                state.status = 'failed';
                state.accounts = [];
                state.error = action.error.message || null;
            });
    }
});

export default accountSlice.reducer;
export const selectAccounts = (state: RootState): Account[] => state.accounts.accounts;
export const selectAccountState = (state: RootState): AccountState => state.accounts;

