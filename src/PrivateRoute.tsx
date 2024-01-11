// PrivateRoute.tsx
import React, {useEffect} from 'react';
import {Route, Navigate, RouteProps} from 'react-router-dom';
import {useDispatch, useSelector} from "react-redux";
import {fetchUser, selectUserState} from "./redux/userSlice";
import {useAppDispatch} from "./redux/store";
import {getUserTransactions} from "./Backend";


interface PrivateRouteProps {
    element: React.ReactElement;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({element}) => {
    const dispatch = useAppDispatch();
    const sessionState = useSelector(selectUserState)
    console.log(sessionState)
    const isAuthenticated = sessionState && sessionState.status !== 'failed'
    //
    useEffect(() => {
        dispatch(fetchUser())
    }, [isAuthenticated]);

    return isAuthenticated ? element : <Navigate to="/login"/>;
};

export default PrivateRoute;

