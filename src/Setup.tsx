import {useDispatch, useSelector} from "react-redux";
import {selectSession} from "./redux/session_slice";
import React, {useEffect} from "react";
import {useAppDispatch, useAppSelector} from "./redux/store";
import {fetchUser} from "./redux/userSlice";


type SetupProps = {
    children: React.ReactNode;
};
const Setup = (props: SetupProps) => {
    const session = useAppSelector(selectSession);
    const dispatch = useAppDispatch()
    useEffect(() => {
        dispatch(fetchUser()).unwrap()

    }, [])

    return (
        <div>{props.children}</div>

    )
}

export default Setup;