// userSlice.ts
import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {
    getClientExcelMapping,
    getClientUserList,
    getVendorList,
    setClientExcelMapping,
} from '../Backend';
import {RootState} from "./store";
import {Account} from "./accountSlice";
import {User} from "./userSlice";


export interface ExcelMapping {
    id: number,
    client_id: number,
    account_owner?: number,
    date?: number,
    name?: number,
    amount?: number,
    internal_account?: number,
    memo?: number
}

export interface SetClientExcelMappingRequest {
    id: number,
    account_owner?: number | "null",
    date?: number | "null",
    name?: number | "null",
    amount?: number | "null",
    internal_account?: number | "null",
    memo?: number | "null"
}

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
    vendors: Vendor[],
    excelMapping?: ExcelMapping,
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

export const fetchClientExcelMapping = createAsyncThunk('client/fetchClientExcelMapping', async () => {
    return await getClientExcelMapping();
});

export const updateClientExcelMapping = createAsyncThunk('client/updateClientExcelMapping', async (request: SetClientExcelMappingRequest) => {
    return await setClientExcelMapping(request)
})
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
            })
            .addCase(fetchClientExcelMapping.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchClientExcelMapping.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.excelMapping = action.payload;
                state.error = null;
            })
            .addCase(fetchClientExcelMapping.rejected, (state, action) => {
                state.status = 'failed';
                state.excelMapping = undefined
                state.error = action.error.message || null;
            })
            .addCase(updateClientExcelMapping.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(updateClientExcelMapping.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.excelMapping = action.payload;
                state.error = null;
            })
            .addCase(updateClientExcelMapping.rejected, (state, action) => {
                state.status = 'failed';
                state.excelMapping = undefined
                state.error = action.error.message || null;
            });
    }
});

export default clientSlice.reducer;
export const selectActiveUsers = (state: RootState): User[] => state.client.activeUsers;
export const selectPendingUsers = (state: RootState): User[] => state.client.pendingUsers;
export const selectVendors = (state: RootState): Vendor[] => state.client.vendors
export const selectExcelMapping = (state: RootState): ExcelMapping | undefined => state.client.excelMapping

