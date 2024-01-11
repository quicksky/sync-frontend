import React, {useEffect} from 'react';
import {Navigate} from 'react-router-dom';
import {useSelector} from "react-redux";
import {fetchUser, selectUserState} from "./redux/userSlice";
import {useAppDispatch} from "./redux/store";


interface PrivateRouteProps {
    element: React.ReactElement;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({element}) => {
    const dispatch = useAppDispatch();
    const sessionState = useSelector(selectUserState)
    console.log(sessionState)
    const isAuthenticated = sessionState && sessionState.status !== 'failed'
    useEffect(() => {
        dispatch(fetchUser())
    }, [isAuthenticated]);

    return isAuthenticated ? element : <Navigate to="/login"/>;
};

export default PrivateRoute;

