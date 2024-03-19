// userSlice.ts
import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {getClientUserList, getVendorList} from '../Backend';
import {RootState} from "./store";
import {Account} from "./accountSlice";
import {User} from "./userSlice";


export interface GetClientUserListResponse {
    pending: User[],
    active: User[]
}

export interface Vendor {
    id: number,
    vendor_name: string,
    aliases: {
        vendor_alias: string,
        starts_with: boolean
    }[]
}

interface ClientState {
    pendingUsers: User[],
    activeUsers: User[],
    vendors: Vendor[]
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: ClientState = {
    pendingUsers: [],
    activeUsers: [],
    vendors: [],
    status: 'idle',
    error: null,
};


export const fetchUserList = createAsyncThunk('client/fetchUserList', async () => {
    return await getClientUserList();
});
export const fetchVendorList = createAsyncThunk('client/fetchVendorList', async () => {
    return await getVendorList();
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
            })
            .addCase(fetchVendorList.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchVendorList.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.vendors = action.payload;
                state.error = null;
            })
            .addCase(fetchVendorList.rejected, (state, action) => {
                state.status = 'failed';
                state.vendors = []
                state.error = action.error.message || null;
            });
    }
});

export default clientSlice.reducer;
export const selectActiveUsers = (state: RootState): User[] => state.client.activeUsers;
export const selectPendingUsers = (state: RootState): User[] => state.client.pendingUsers;
export const selectVendors = (state: RootState): Vendor[] => state.client.vendors

