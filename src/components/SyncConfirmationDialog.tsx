import React from "react";
import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from "@mui/material";

export const SyncConfirmationDialog: React.FC<{
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmButtonName?: string;
}> = ({open, onClose, onConfirm, title, message, confirmButtonName}) => (
    <Dialog open={open} onClose={onClose}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent
            sx={{m: 2}}>
            <DialogContentText>{message}</DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button variant='contained' onClick={onClose}>Cancel</Button>
            <Button onClick={onConfirm} color="secondary" variant='contained'>
                {confirmButtonName ? confirmButtonName : "Confirm"}
            </Button>
        </DialogActions>
    </Dialog>
);
