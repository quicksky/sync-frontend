// userSlice.ts
import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {exchangeToken, generateLinkToken} from '../Backend';
import {RootState} from "./store";

interface Session {
    link_token: string | null
}

interface SessionState {
    session: Session | null;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: SessionState = {
    session: null,
    status: 'idle',
    error: null,
};

export const fetchLinkToken = createAsyncThunk('plaid/fetchLinkToken', async () => {
    return await generateLinkToken();
});

export const exchangeAndStoreLinkToken = createAsyncThunk('plaid/exchangeToken', async (token: string) => {
    return await exchangeToken(token);
})


const sessionSlice = createSlice({
    name: 'session',
    initialState,
    reducers: {},
    extraReducers: builder => {
        builder
            .addCase(fetchLinkToken.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchLinkToken.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.session = action.payload
                state.error = null;
            })
            .addCase(fetchLinkToken.rejected, (state, action) => {
                state.status = 'failed';
                state.session = null;
                state.error = action.error.message || null;
            })
            .addCase(exchangeAndStoreLinkToken.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.session = action.payload
                state.error = null
            })
            .addCase(exchangeAndStoreLinkToken.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(exchangeAndStoreLinkToken.rejected, (state, action) => {
                state.status = 'failed';
                state.session = null
                state.error = action.error.message || null
            })


    }
});

export default sessionSlice.reducer;
export const selectSession = (state: RootState) => state.session;
export const selectSessionState = (state: RootState) => state.session.session

