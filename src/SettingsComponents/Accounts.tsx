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
    TableContainer,
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
            <Box sx={{width: "65%", mx: 'auto'}}>
                <Box display="flex" justifyContent="space-between" alignItems="center" sx={{mb: 2}}>
                    <Typography variant="h6" fontWeight={700}>Available Accounts</Typography>
                    <Button variant="contained" color="primary" startIcon={<AddIcon/>}
                            onClick={handleClickOpen}>
                        Add Accounts
                    </Button>
                    <Dialog
                        open={open}
                        onClose={handleClose}
                        PaperProps={{
                            component: 'form',
                        }}
                    >
                        <DialogTitle color="primary">Add Accounts</DialogTitle>
                        <DialogContent>
                            <TextField
                                onChange={(e) => setAddAccountText(e.target.value)}
                                color="primary"
                                required
                                margin="dense"
                                label="Enter account names"
                                multiline
                                rows={3}
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
                <TableContainer component={Paper} elevation={1} sx={{maxHeight: '75vh'}}>
                    <Table aria-label="simple table" stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell align="left" width="90%">Name</TableCell>
                                <TableCell align="right" width="10%"/>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {accounts.map((account) => (
                                <TableRow key={account.id} hover>
                                    <TableCell align="left" width="90%">
                                        {<div style={{wordBreak: 'break-all'}}>{account.name}</div>}
                                    </TableCell>
                                    <TableCell align="right" width="10%">
                                        <IconButton onClick={() => handleDelete(account.id)}
                                                    aria-label="delete" color="error">
                                            <RemoveIcon fontSize="small"/>
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </>
    );
};

export default AccountsPanel;
