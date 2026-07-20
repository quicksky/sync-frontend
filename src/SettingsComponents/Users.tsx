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
    Checkbox,
    FormControlLabel,
    Tooltip,
    Chip,
    List,
    ListItem
} from '@mui/material';
import Box from "@mui/material/Box"; // Adapt these imports to your project structure
import {MailOutline} from "@mui/icons-material";
import EditIcon from '@mui/icons-material/Edit';
import {SyncConfirmationDialog} from '../components/SyncConfirmationDialog';
import {reInviteUser} from "../Backend";
import {
    createUser,
    getUserAccounts,
    grantAccount,
    revokeAccount
} from "../Backend";
import {useAppDispatch, useAppSelector} from "../redux/store";
import {selectActiveUsers, selectPendingUsers} from "../redux/clientSlice";
import {fetchUserList} from "../redux/clientSlice";
import {Account, selectClientAccounts} from "../redux/accountSlice";


const UsersPanel: React.FC = () => {
    const dispatch = useAppDispatch()
    const [resendUserInviteDialogOpen, setResendUserInviteDialogOpen] = useState<boolean>(false)
    const [userId, setUserId] = useState<string>("")
    const [checkboxDialogUserId, setCheckboxDialogUserId] = useState<string>("")
    const [userAccounts, setUserAccounts] = useState<Account[]>([])
    const [inviteUserAdmin, setInviteUserAdmin] = useState<boolean>(false)
    const [openCheckboxDialog, setOpenCheckboxDialog] = React.useState(false);
    const activeUsers = useAppSelector(selectActiveUsers)
    const pendingUsers = useAppSelector(selectPendingUsers)
    const accounts = useAppSelector(selectClientAccounts)

    const [open, setOpen] = React.useState(false);
    const handleClickOpen = () => {
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
    };

    const handleOpenCheckboxDialog = (user_id: string) => {
        setCheckboxDialogUserId(user_id)
        getUserAccounts({user_id: user_id}).then(r => {
            setUserAccounts(r)
            setOpenCheckboxDialog(true)
        })
    }

    const onAccountCheckboxClick = (checked: boolean, account_id: number, user_id: string) => {
        checked ? grantAccount({user_id: user_id, account_id: account_id}).then(() => {
            getUserAccounts({user_id: user_id}).then(r => {
                setUserAccounts(r)
            })
        }) : revokeAccount({user_id: user_id, account_id: account_id}).then(() => {
            getUserAccounts({user_id: user_id}).then(r => {
                setUserAccounts(r)
            })
        })
    }

    const handleCloseCheckboxDialog = () => {
        setOpenCheckboxDialog(false)
    }

    const onUserInviteSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        const formJson = Object.fromEntries((formData as any).entries())
        const firstName = formJson.first_name
        const lastName = formJson.last_name
        const email = formJson.email
        const cardNumber = formJson.card_number
        createUser({
            role: inviteUserAdmin ? 2 : 1,
            first_name: firstName,
            last_name: lastName,
            email: email,
            card_number: cardNumber
        }).then(r => {
            dispatch(fetchUserList())
            handleClose();
        }).catch(e => {
            // if (e.code == "ERR_BAD_REQUEST") {
            //     setExportError(true)
            //     setExportErrorTest("Dates are not in the correct format")
            // } else {
            //     setExportError(true)
            //     setExportErrorTest("Server error")
            // }
        })
    }

    return (
        <>
            <SyncConfirmationDialog open={resendUserInviteDialogOpen}
                onClose={() => setResendUserInviteDialogOpen(false)}
                message={"Re-invite this user?"}
                title={"Resend Invite"}
                confirmButtonName={"Send"}
                onConfirm={() => {
                    //TODO: Use error dialogs
                    reInviteUser(userId).then(() => {
                        setUserId("")
                        setResendUserInviteDialogOpen(false);
                    })
                }}/>
            <Box sx={{width: "75%", mx: 'auto'}}>
                <Box display="flex" justifyContent="space-between" alignItems="center" sx={{mb: 2}}>
                    <Typography variant="h6" fontWeight={700}>Users</Typography>
                    <Button variant="contained" onClick={handleClickOpen}>
                        Invite User
                    </Button>
                </Box>
                <TableContainer component={Paper} elevation={1}>
                    <Table aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell align="left">First Name</TableCell>
                                <TableCell align="right">Last Name</TableCell>
                                <TableCell align="right">Email</TableCell>
                                <TableCell align="center">Card Number</TableCell>
                                <TableCell align="right">Role</TableCell>
                                <TableCell align="center">Status</TableCell>
                                <TableCell align="center">Accounts</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {activeUsers.concat(pendingUsers).map((user) => (
                                <TableRow key={user.id} hover>
                                    <TableCell align="left">{user.first_name}</TableCell>
                                    <TableCell align="right">{user.last_name}</TableCell>
                                    <TableCell align="right">{user.email}</TableCell>
                                    <TableCell align="center">{user.card_number}</TableCell>
                                    <TableCell align="right">{user.role > 1 ? "Admin" : "User"}</TableCell>
                                    <TableCell
                                        align="center"
                                    >{pendingUsers.map((user) => user.id).includes(user.id) ? (
                                        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5}}>
                                            <Chip label="Pending" size="small" color="warning" variant="outlined"/>
                                            <Tooltip title="Resend invite">
                                                <IconButton onClick={() => {
                                                    setUserId(user.id)
                                                    setResendUserInviteDialogOpen(true)
                                                }} size="small"><MailOutline fontSize="small"/></IconButton>
                                            </Tooltip>
                                        </Box>) : <Chip label="Active" size="small" color="success" variant="outlined"/>}</TableCell>
                                    <TableCell align="center">
                                        {user.role > 1 ?
                                            <IconButton disabled={true}>
                                                <EditIcon fontSize="small"/>
                                            </IconButton>
                                            :
                                            <IconButton onClick={() => handleOpenCheckboxDialog(user.id)}>
                                                <EditIcon fontSize="small"/>
                                            </IconButton>
                                        }
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>


            {/*Invite Users Dialog*/}
            <Dialog
                open={open}
                onClose={handleClose}
                PaperProps={{
                    component: 'form',
                    onSubmit: onUserInviteSubmit,
                }}
            >
                <DialogTitle color="primary">Enter User Information</DialogTitle>
                <DialogContent>
                    <TextField
                        color="primary"
                        required
                        margin="dense"
                        label="First Name"
                        name="first_name"
                        id="first_name"
                        fullWidth
                        variant="standard"
                    />
                    <TextField
                        required
                        color="primary"
                        margin="dense"
                        label="Last Name"
                        name="last_name"
                        id="last_name"
                        fullWidth
                        variant="standard"
                    />
                    <TextField
                        color="primary"
                        required
                        margin="dense"
                        label="Email"
                        name="email"
                        id="email"
                        fullWidth
                        variant="standard"
                    />
                    <TextField
                        color="primary"
                        required
                        margin="dense"
                        label="Card Number"
                        name="card_number"
                        id="card_number"
                        fullWidth
                        variant="standard"
                    />
                    <FormControlLabel
                        control={<Checkbox sx={{
                            "& + .MuiFormControlLabel-label": {
                                color: "secondary.main"
                            }
                        }} checked={inviteUserAdmin}
                                            onChange={(evt) => setInviteUserAdmin(evt.target.checked)}/>}
                        label="Admin"
                        name="is_admin"
                        id="is_admin"
                    />
                </DialogContent>
                {/*{exportError ? <Alert severity="error">{exportErrorText}</Alert> : undefined}*/}
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button type="submit" variant="contained" color="secondary">Invite User</Button>
                </DialogActions>
            </Dialog>


            {/*User Accounts Checkbox Dialog*/}
            <Dialog
                open={openCheckboxDialog}
                onClose={handleCloseCheckboxDialog}
                PaperProps={{
                    component: 'form',
                }}
            >
                <DialogTitle color="primary">Edit User Accounts</DialogTitle>
                <DialogContent>
                    <List dense sx={{minWidth: 300, maxWidth: 800, height: '65vh'}}>
                        {accounts.map((account) => (
                            <ListItem key={account.id}>
                                <FormControlLabel
                                    control={
                                        <Checkbox sx={{
                                            "& + .MuiFormControlLabel-label": {
                                                color: "primary.main"
                                            }
                                        }}
                                                    checked={userAccounts.map(a => a.id).includes(account.id)}
                                                    onChange={(evt) => onAccountCheckboxClick(evt.target.checked, account.id, checkboxDialogUserId)}/>
                                    }
                                    label={<div style={{wordBreak: 'break-all'}}>{account.name}</div>}
                                    name="is_admin"
                                    id="is_admin"
                                />
                            </ListItem>
                        ))}
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseCheckboxDialog}>Close</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default UsersPanel;