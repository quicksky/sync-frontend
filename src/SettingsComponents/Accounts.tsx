import React, {useState} from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Typography,
    IconButton,
    Paper,
} from '@mui/material';
import Box from "@mui/material/Box";
import {
    addClientAccounts,
    deleteClientAccount
} from "../Backend";
import {useAppDispatch, useAppSelector} from "../redux/store";
import {
    fetchClientAccounts,
    selectClientAccounts,
} from "../redux/accountSlice";
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import {TABLE_FRAME_BODY_SX, TABLE_FRAME_HEAD_SX, TABLE_FRAME_SX} from "../App";

const TABLE_SX = {tableLayout: 'fixed' as const};

// Shared by the header and body tables so their columns line up.
const columnGroup = (
    <colgroup>
        <col style={{width: '90%'}}/>
        <col style={{width: '10%'}}/>
    </colgroup>
);

const AccountsPanel: React.FC = () => {
    const [addAccountText, setAddAccountText] = useState("")
    const accounts = useAppSelector(selectClientAccounts)
    const dispatch = useAppDispatch()

    const [open, setOpen] = React.useState(false);
    const handleClickOpen = () => {
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
    };

    const handleAddAccounts = () => {
        addClientAccounts(addAccountText).then(() => {
            dispatch(fetchClientAccounts())
            handleClose()
        })
    }

    const handleDelete = (id: number) => {
        deleteClientAccount(id).then(() => {
            dispatch(fetchClientAccounts())
        })
    }

    return (
        <>
            <Box sx={{width: "65%", mx: 'auto', display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: 0}}>
                <Box display="flex" justifyContent="space-between" alignItems="center" sx={{mb: 2, flexShrink: 0}}>
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 1.25}}>
                        <Box sx={{
                            width: 4,
                            height: 22,
                            borderRadius: 2,
                            backgroundImage: 'linear-gradient(180deg, #D9BF95 0%, #A67C42 100%)',
                        }}/>
                        <Typography variant="h6" fontWeight={700}>Available Accounts</Typography>
                    </Box>
                    <Button variant="contained" color="primary" startIcon={<AddIcon/>}
                            onClick={handleClickOpen}>
                        Add Accounts
                    </Button>
                    <Dialog
                        open={open}
                        onClose={handleClose}
                        fullWidth
                        maxWidth="sm"
                        PaperProps={{
                            component: 'form',
                        }}
                    >
                        <DialogTitle color="primary">Add Accounts</DialogTitle>
                        <DialogContent>
                            <TextField
                                onChange={(e) => setAddAccountText(e.target.value)}
                                color="secondary"
                                required
                                margin="dense"
                                label="Enter account names"
                                multiline
                                rows={4}
                                fullWidth
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleClose}>Cancel</Button>
                            <Button onClick={handleAddAccounts} variant="contained"
                                    color="secondary">Add</Button>
                        </DialogActions>
                    </Dialog>
                </Box>
                <Paper elevation={1} sx={TABLE_FRAME_SX}>
                    <Box sx={TABLE_FRAME_HEAD_SX}>
                        <Table sx={TABLE_SX}>
                            {columnGroup}
                            <TableHead>
                                <TableRow>
                                    <TableCell align="left">Name</TableCell>
                                    <TableCell align="right"/>
                                </TableRow>
                            </TableHead>
                        </Table>
                    </Box>
                    <Box tabIndex={0} sx={TABLE_FRAME_BODY_SX}>
                        <Table aria-label="accounts table" sx={TABLE_SX}>
                            {columnGroup}
                            <TableBody>
                                {accounts.map((account) => (
                                    <TableRow key={account.id} hover>
                                        <TableCell align="left">
                                            {<div style={{wordBreak: 'break-all'}}>{account.name}</div>}
                                        </TableCell>
                                        <TableCell align="right">
                                            <IconButton onClick={() => handleDelete(account.id)}
                                                        aria-label="delete" color="error">
                                                <RemoveIcon fontSize="small"/>
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Box>
                </Paper>
            </Box>
        </>
    );
};

export default AccountsPanel;
