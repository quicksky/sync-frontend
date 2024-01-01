import React, {useEffect} from "react";
import {Button} from "@mui/material";
import {usePlaidLink} from "react-plaid-link";
import {useAppDispatch} from "./redux/store";
import {fetchLinkToken, selectSession} from "./redux/session_slice";
import {useSelector} from "react-redux";

const Link: React.FC = () => {
    //
    // const onSuccess = React.useCallback(
    //     (public_token: string) => {
    //         // If the access_token is needed, send public_token to server
    //         const exchangePublicTokenForAccessToken = async () => {
    //             const response = await fetch("/api/set_access_token", {
    //                 method: "POST",
    //                 headers: {
    //                     "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
    //                 },
    //                 body: `public_token=${public_token}`,
    //             });
    //             if (!response.ok) {
    //                 dispatch({
    //                     type: "SET_STATE",
    //                     state: {
    //                         itemId: `no item_id retrieved`,
    //                         accessToken: `no access_token retrieved`,
    //                         isItemAccess: false,
    //                     },
    //                 });
    //                 return;
    //             }
    //             const data = await response.json();
    //             dispatch({
    //                 type: "SET_STATE",
    //                 state: {
    //                     itemId: data.item_id,
    //                     accessToken: data.access_token,
    //                     isItemAccess: true,
    //                 },
    //             });
    //         };
    //     })

    // const onSuccess = React.useCallback(
    //     (public_token: string) => {
    //         // If the access_token is needed, send public_token to server
    //         const exchangePublicTokenForAccessToken = async () => {
    //             const response = await fetch("/api/set_access_token", {
    //                 method: "POST",
    //                 headers: {
    //                     "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
    //                 },
    //                 body: `public_token=${public_token}`,
    //             });
    //             if (!response.ok) {
    //                 dispatch({
    //                     type: "SET_STATE",
    //                     state: {
    //                         itemId: `no item_id retrieved`,
    //                         accessToken: `no access_token retrieved`,
    //                         isItemAccess: false,
    //                     },
    //                 });
    //                 return;
    //             }
    //             const data = await response.json();
    //             dispatch({
    //                 type: "SET_STATE",
    //                 state: {
    //                     itemId: data.item_id,
    //                     accessToken: data.access_token,
    //                     isItemAccess: true,
    //                 },
    //             });
    //         };
    //
    //         // 'payment_initiation' products do not require the public_token to be exchanged for an access_token.
    //         if (isPaymentInitiation){
    //             dispatch({ type: "SET_STATE", state: { isItemAccess: false } });
    //         } else {
    //             exchangePublicTokenForAccessToken();
    //         }
    //
    //         dispatch({ type: "SET_STATE", state: { linkSuccess: true } });
    //         window.history.pushState("", "", "/");
    //     },
    //     [dispatch]
    // );

    const dispatch = useAppDispatch();
    const session = useSelector(selectSession);
    useEffect(() => {
        dispatch(fetchLinkToken())
    }, [dispatch])


    const onSuccess = React.useCallback(
        (public_token: string) => {
            console.log(public_token)
        },
        []
    );


    const config: Parameters<typeof usePlaidLink>[0] = {
        token: session.session ? session.session.link_token : null,
        onSuccess,
    };


    const {open, ready} = usePlaidLink(config);


    return (
        <Button onClick={() => open()} disabled={!ready}>
            Launch Link
        </Button>
    )
}

export default Link;