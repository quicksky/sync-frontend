// userSlice.ts
import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {getClientUserList} from '../Backend';
import {RootState} from "./store";
import {Account} from "./accountSlice";
import {User} from "./userSlice";


export interface GetClientUserListResponse {
    pending: User[],
    active: User[]
}

interface ClientState {
    pendingUsers: User[],
    activeUsers: User[]
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: ClientState = {
    pendingUsers: [],
    activeUsers: [],
    status: 'idle',
    error: null,
};


export const fetchUserList = createAsyncThunk('client/fetchUserList', async () => {
    return await getClientUserList();
});

const clientSlice = createSlice({
    name: 'client',
    initialState,
    reducers: {},
    extraReducers: builder => {
        builder
            .addCase(fetchUserList.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchUserList.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.activeUsers = action.payload.active;
                state.pendingUsers = action.payload.pending;
                state.error = null;
            })
            .addCase(fetchUserList.rejected, (state, action) => {
                state.status = 'failed';
                state.activeUsers = [];
                state.pendingUsers = [];
                state.error = action.error.message || null;
            });
    }
});

export default clientSlice.reducer;
export const selectActiveUsers = (state: RootState): User[] => state.client.activeUsers;
export const selectPendingUsers = (state: RootState): User[] => state.client.pendingUsers;

