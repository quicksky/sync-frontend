// store.ts
import {configureStore, Action} from '@reduxjs/toolkit';
import userReducer from './userSlice';
import linkTokenReducer from './linkTokenSlice'
import accountReducer from './accountSlice'
import repairTokenReducer from './repairTokenSlice'
import clientReducer from './clientSlice'
import {ThunkAction} from 'redux-thunk';
import {TypedUseSelectorHook, useDispatch, useSelector} from "react-redux";

const store = configureStore({
    reducer: {
        user: userReducer,
        linkToken: linkTokenReducer,
        repairToken: repairTokenReducer,
        accounts: accountReducer,
        client: clientReducer
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk = ThunkAction<void, RootState, unknown, Action<string>>;

export default store;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
