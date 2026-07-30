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
import {TABLE_FRAME_BODY_SX, TABLE_FRAME_HEAD_SX, TABLE_FRAME_SX} from "../App";

// Widths and alignment live here so the header and body tables — which are
// separate tables, to keep the scrollbar out of the header — stay in step. Body
// cell alignment must match the `align` values below, in order.
const COLUMNS: { label: string; width: string; align: 'left' | 'right' | 'center' }[] = [
    {label: "First Name", width: "12%", align: "left"},
    {label: "Last Name", width: "12%", align: "right"},
    {label: "Email", width: "26%", align: "right"},
    {label: "Card Number", width: "14%", align: "center"},
    {label: "Role", width: "9%", align: "right"},
    {label: "Status", width: "15%", align: "center"},
    {label: "Accounts", width: "12%", align: "center"},
];

// Emails are long and columns are fixed, so wrap rather than overflow.
const TABLE_SX = {tableLayout: 'fixed' as const, overflowWrap: 'anywhere' as const};

const columnGroup = (
    <colgroup>
        {COLUMNS.map((column) => (
            <col key={column.label} style={{width: column.width}}/>
        ))}
    </colgroup>
);

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
            <Box sx={{width: "75%", mx: 'auto', display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: 0}}>
                <Box display="flex" justifyContent="space-between" alignItems="center" sx={{mb: 2, flexShrink: 0}}>
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 1.25}}>
                        <Box sx={{
                            width: 4,
                            height: 22,
                            borderRadius: 2,
                            backgroundImage: 'linear-gradient(180deg, #D9BF95 0%, #A67C42 100%)',
                        }}/>
                        <Typography variant="h6" fontWeight={700}>Users</Typography>
                    </Box>
                    <Button variant="contained" onClick={handleClickOpen}>
                        Invite User
                    </Button>
                </Box>
                <Paper elevation={1} sx={TABLE_FRAME_SX}>
                    <Box sx={TABLE_FRAME_HEAD_SX}>
                        <Table sx={TABLE_SX}>
                            {columnGroup}
                            <TableHead>
                                <TableRow>
                                    {COLUMNS.map((column) => (
                                        <TableCell key={column.label} align={column.align}>{column.label}</TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                        </Table>
                    </Box>
                    <Box tabIndex={0} sx={TABLE_FRAME_BODY_SX}>
                        <Table aria-label="users table" sx={TABLE_SX}>
                            {columnGroup}
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
                    </Box>
                </Paper>
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
                        color="secondary"
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
                        color="secondary"
                        margin="dense"
                        label="Last Name"
                        name="last_name"
                        id="last_name"
                        fullWidth
                        variant="standard"
                    />
                    <TextField
                        color="secondary"
                        required
                        margin="dense"
                        label="Email"
                        name="email"
                        id="email"
                        fullWidth
                        variant="standard"
                    />
                    <TextField
                        color="secondary"
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