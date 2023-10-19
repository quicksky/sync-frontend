// userSlice.ts
import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {getUserApi, loginUserApi} from '../Backend';
import {RootState} from "./store";

interface User {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
}

interface UserState {
    user: User | null;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: UserState = {
    user: null,
    status: 'idle',
    error: null,
};

export const loginUser = createAsyncThunk('user/loginUser', async (credentials: { email: string; password: string }) => {
    return await loginUserApi(credentials.email, credentials.password);
});

export const fetchUser = createAsyncThunk('user/fetchUser', async () => {
    return await getUserApi();
});


const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {},
    extraReducers: builder => {
        builder
            .addCase(loginUser.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.user = action.payload;
                state.error = null;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.status = 'failed';
                state.user = null;
                state.error = action.error.message || null;
            })
            .addCase(fetchUser.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchUser.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.user = action.payload;
                state.error = null;
            })
            .addCase(fetchUser.rejected, (state, action) => {
                state.status = 'failed';
                state.user = null;
                state.error = action.error.message || null;
            });
    }
});

export default userSlice.reducer;
export const selectUser = (state: RootState) => state.user.user;
export const selectUserState = (state: RootState) => state.user

