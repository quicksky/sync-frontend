import {
    FETCH_USER_REQUEST,
    FETCH_USER_SUCCESS,
    FETCH_USER_FAILURE
} from './actionTypes';

export const fetchUserRequest = () => {
    return {
        type: FETCH_USER_REQUEST
    };
};

export const fetchUserSuccess = user => {
    return {
        type: FETCH_USER_SUCCESS,
        payload: user
    };
};

export const fetchUserFailure = error => {
    return {
        type: FETCH_USER_FAILURE,
        payload: error
    };
};
