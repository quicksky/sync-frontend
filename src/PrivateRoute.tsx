// PrivateRoute.tsx
import React from 'react';
import {Route, Navigate, RouteProps} from 'react-router-dom';
import {useDispatch, useSelector} from "react-redux";
import {fetchUser, selectUserState} from "./redux/userSlice";
import {useAppDispatch} from "./redux/store";


interface PrivateRouteProps {
    path: string;
    element: React.ReactElement;
}


const PrivateRoute: React.FC<PrivateRouteProps> = ({element: Component, ...rest}) => {
    const dispatch = useAppDispatch()
    dispatch(fetchUser())

    const sessionState = useSelector(selectUserState)
    const isAuthenticated = sessionState.status == 'succeeded'

    return (
        isAuthenticated ? (
            <Route {...rest} element={Component}/>
        ) : (
            <Navigate to="/login" replace/>
        )
    );
};

export default PrivateRoute;
