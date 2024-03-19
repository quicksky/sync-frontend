import React, {useEffect} from 'react';
import {Navigate, useNavigate} from 'react-router-dom';
import {fetchUser, selectUserState} from "./redux/userSlice";
import {useAppDispatch, useAppSelector} from "./redux/store";


interface PrivateRouteProps {
    element: React.ReactElement;
}

//ALL of this needs to be reworked including the auto login
//i want to use history to be much smarter about what to do in the different situations

const PrivateRoute: React.FC<PrivateRouteProps> = ({element}) => {
    const dispatch = useAppDispatch();
    const sessionState = useAppSelector(selectUserState)
    console.log(sessionState)
    const isAuthenticated = sessionState && sessionState.status === 'succeeded'
    const allowed = sessionState && sessionState.status !== 'failed'
    useEffect(() => {
        !isAuthenticated && dispatch(fetchUser())
    }, [dispatch, isAuthenticated]);

    return allowed ? element : <Navigate to="/"/>;
};

export default PrivateRoute;

