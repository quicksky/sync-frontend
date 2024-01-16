// store.ts
import {configureStore, Action} from '@reduxjs/toolkit';
import userReducer from './userSlice';
import sessionReducer from './session_slice'
import {ThunkAction} from 'redux-thunk';
import {TypedUseSelectorHook, useDispatch, useSelector} from "react-redux";

const store = configureStore({
    reducer: {
        user: userReducer,
        session: sessionReducer
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk = ThunkAction<void, RootState, unknown, Action<string>>;

export default store;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
