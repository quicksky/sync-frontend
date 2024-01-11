import React, {useEffect} from 'react';
import {Navigate} from 'react-router-dom';
import {fetchUser, selectUserState} from "./redux/userSlice";
import {useAppDispatch, useAppSelector} from "./redux/store";


interface PrivateRouteProps {
    element: React.ReactElement;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({element}) => {
    const dispatch = useAppDispatch();
    const sessionState = useAppSelector(selectUserState)
    console.log(sessionState)
    const isAuthenticated = sessionState && sessionState.status !== 'failed'
    useEffect(() => {
        dispatch(fetchUser())
    }, [dispatch, isAuthenticated]);

    return isAuthenticated ? element : <Navigate to="/login"/>;
};

export default PrivateRoute;

