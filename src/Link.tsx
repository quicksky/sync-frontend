import React, {useEffect} from "react";
import {Button} from "@mui/material";
import {usePlaidLink} from "react-plaid-link";
import {useAppDispatch} from "./redux/store";
import {exchangeAndStoreLinkToken, fetchLinkToken, fetchRepairModeToken, selectLinkToken} from "./redux/linkTokenSlice";
import {useSelector} from "react-redux";
import {selectRepairToken} from "./redux/repairTokenSlice";

export interface LinkProps {
    repair: boolean
}

const Link: React.FC<LinkProps> = (props: LinkProps) => {
    const dispatch = useAppDispatch();
    const link_token = useSelector(selectLinkToken);
    const repair_token = useSelector(selectRepairToken)
    useEffect(() => {
        if (!props.repair) {
            dispatch(fetchLinkToken())
        } else {
            dispatch(fetchRepairModeToken())
        }
    }, [dispatch])
    const onSuccess = React.useCallback(
        (public_token: string) => {
            if (!props.repair) {
                dispatch(exchangeAndStoreLinkToken(public_token))
            }
        },
        [dispatch]
    );
    const config: Parameters<typeof usePlaidLink>[0] = !props.repair ? {
        token: link_token ? link_token.link_token : null,
        onSuccess,
    } : {
        token: repair_token ? repair_token.link_token : null,
        onSuccess,
    }
    const {open, ready} = usePlaidLink(config);
    return (
        <Button onClick={() => open()} disabled={!ready}>
            {!props.repair ? "Connect" : "Reauthorize"}
        </Button>
    )
}

export default Link;