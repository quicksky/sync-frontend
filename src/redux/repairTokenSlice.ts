// userSlice.ts
import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {generateRepairModeToken} from '../Backend';
import {RootState} from "./store";

interface RepairToken {
    link_token: string | null
}

interface RepairTokenState {
    repair_token: RepairToken | null;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: RepairTokenState = {
    repair_token: null,
    status: 'idle',
    error: null,
};

export const fetchRepairModeToken = createAsyncThunk('plaid/fetchRepairModeToken', async () => {
    return await generateRepairModeToken();
});

const repairTokenSlice = createSlice({
    name: 'repairToken',
    initialState,
    reducers: {},
    extraReducers: builder => {
        builder
            .addCase(fetchRepairModeToken.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchRepairModeToken.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.repair_token = action.payload
                state.error = null;
            })
            .addCase(fetchRepairModeToken.rejected, (state, action) => {
                state.status = 'failed';
                state.repair_token = null;
                state.error = action.error.message || null;
            })
    }
});

export default repairTokenSlice.reducer;
export const selectRepairToken = (state: RootState) => state.repairToken.repair_token;
