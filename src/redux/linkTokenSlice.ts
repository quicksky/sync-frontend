// userSlice.ts
import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {exchangeToken, generateLinkToken, generateRepairModeToken} from '../Backend';
import {RootState} from "./store";

interface LinkToken {
    link_token: string | null
}

interface LinkTokenState {
    link_token: LinkToken | null;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: LinkTokenState = {
    link_token: null,
    status: 'idle',
    error: null,
};

export const fetchLinkToken = createAsyncThunk('plaid/fetchLinkToken', async () => {
    return await generateLinkToken();
});

export const fetchRepairModeToken = createAsyncThunk('plaid/fetchRepairModeToken', async () => {
    return await generateRepairModeToken();
});

export const exchangeAndStoreLinkToken = createAsyncThunk('plaid/exchangeToken', async (token: string) => {
    return await exchangeToken(token);
})


const linkTokenSlice = createSlice({
    name: 'linkToken',
    initialState,
    reducers: {},
    extraReducers: builder => {
        builder
            .addCase(fetchLinkToken.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchLinkToken.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.link_token = action.payload
                state.error = null;
            })
            .addCase(fetchLinkToken.rejected, (state, action) => {
                state.status = 'failed';
                state.link_token = null;
                state.error = action.error.message || null;
            })
            .addCase(exchangeAndStoreLinkToken.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.error = null
            })
            .addCase(exchangeAndStoreLinkToken.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(exchangeAndStoreLinkToken.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message || null
            })


    }
});

export default linkTokenSlice.reducer;
export const selectLinkToken = (state: RootState) => state.linkToken.link_token;

