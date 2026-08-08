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
    ListItem,
    ButtonBase,
    alpha,
    Theme
} from '@mui/material';
import Box from "@mui/material/Box"; // Adapt these imports to your project structure
import {
    MailOutline,
    PersonOutline,
    AdminPanelSettingsOutlined,
    CheckRounded
} from "@mui/icons-material";
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
import {
    DIALOG_ACTIONS_SX,
    DIALOG_CONTENT_SX,
    SHADOW_SM,
    TABLE_FRAME_BODY_SX,
    TABLE_FRAME_HEAD_SX,
    TABLE_FRAME_SX
} from "../App";

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

// The invite dialog only has two roles to choose from — the backend's `role: 1`
// (regular) and `role: 2` (admin), the same split `user.role > 1` gates on. Shown
// as a pair of option cards instead of an "Admin" checkbox so the choice states
// what each role actually gets.
const ROLE_OPTIONS: {
    admin: boolean;
    label: string;
    description: string;
    icon: React.ReactNode;
}[] = [
    {
        admin: false,
        label: "User",
        description: "Reconciles transactions and receipts for their own card.",
        icon: <PersonOutline fontSize="small"/>,
    },
    {
        admin: true,
        label: "Admin",
        description: "Also manages accounts, users, vendors, and exports.",
        icon: <AdminPanelSettingsOutlined fontSize="small"/>,
    },
];

// Selected cards pick up the gold border/tint the rest of the overhaul uses for
// an active choice; unselected stay quiet so the pair reads as one control.
const roleCardSx = (selected: boolean) => ({
    flex: 1,
    display: 'flex',
    alignItems: 'flex-start',
    gap: 1.25,
    p: 1.5,
    borderRadius: 3,
    textAlign: 'left' as const,
    border: '1px solid',
    borderColor: selected ? 'secondary.dark' : 'divider',
    backgroundColor: selected
        ? (theme: Theme) => alpha(theme.palette.secondary.main, 0.16)
        : 'transparent',
    boxShadow: selected ? SHADOW_SM : 'none',
    transition: 'background-color 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease',
    '&:hover': {
        borderColor: selected ? 'secondary.dark' : (theme: Theme) => alpha(theme.palette.secondary.main, 0.6),
        backgroundColor: selected
            ? (theme: Theme) => alpha(theme.palette.secondary.main, 0.22)
            : (theme: Theme) => alpha(theme.palette.primary.main, 0.04),
    },
});

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
        // Role is dialog state rather than a form field, so it has to be cleared
        // explicitly — otherwise the next invite silently defaults to Admin.
        setInviteUserAdmin(false);
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
                fullWidth
                maxWidth="sm"
                PaperProps={{
                    component: 'form',
                    onSubmit: onUserInviteSubmit,
                }}
            >
                <DialogTitle component="div" sx={{pb: 0}}>
                    <Box sx={{display: 'flex', alignItems: 'flex-start', gap: 1.25}}>
                        <Box sx={{
                            width: 4,
                            height: 22,
                            mt: 0.4,
                            borderRadius: 2,
                            backgroundImage: 'linear-gradient(180deg, #D9BF95 0%, #A67C42 100%)',
                        }}/>
                        <Box>
                            <Typography variant="h6" component="h2" fontWeight={700} color="primary">
                                Invite User
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                They'll get an email invitation to finish setting up their account.
                            </Typography>
                        </Box>
                    </Box>
                </DialogTitle>
                <DialogContent sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2.5,
                    ...DIALOG_CONTENT_SX,
                }}>
                    <Box sx={{display: 'flex', flexDirection: {xs: 'column', sm: 'row'}, gap: 2}}>
                        <TextField
                            autoFocus
                            color="secondary"
                            required
                            label="First Name"
                            name="first_name"
                            id="first_name"
                            sx={{flex: 1}}
                        />
                        <TextField
                            required
                            color="secondary"
                            label="Last Name"
                            name="last_name"
                            id="last_name"
                            sx={{flex: 1}}
                        />
                    </Box>
                    <TextField
                        color="secondary"
                        required
                        type="email"
                        label="Email"
                        name="email"
                        id="email"
                        fullWidth
                    />
                    <TextField
                        color="secondary"
                        required
                        label="Card Number"
                        name="card_number"
                        id="card_number"
                        fullWidth
                        helperText="Matches this user to the transactions synced for their card."
                    />
                    <Box>
                        <Typography variant="overline" sx={{
                            display: 'block',
                            mb: 1,
                            color: 'text.secondary',
                            letterSpacing: '0.08em',
                        }}>
                            Role
                        </Typography>
                        <Box role="radiogroup" aria-label="Role"
                             sx={{display: 'flex', flexDirection: {xs: 'column', sm: 'row'}, gap: 1.5}}>
                            {ROLE_OPTIONS.map((option) => {
                                const selected = inviteUserAdmin === option.admin
                                return (
                                    <ButtonBase
                                        key={option.label}
                                        role="radio"
                                        aria-checked={selected}
                                        onClick={() => setInviteUserAdmin(option.admin)}
                                        sx={roleCardSx(selected)}
                                    >
                                        <Box sx={{
                                            display: 'flex',
                                            mt: 0.2,
                                            color: selected ? 'secondary.dark' : 'text.secondary',
                                        }}>
                                            {option.icon}
                                        </Box>
                                        <Box sx={{flex: 1}}>
                                            <Typography variant="subtitle2" fontWeight={700}
                                                        color={selected ? 'primary.main' : 'text.primary'}>
                                                {option.label}
                                            </Typography>
                                            <Typography variant="caption" component="span" sx={{
                                                display: 'block',
                                                color: 'text.secondary',
                                                lineHeight: 1.45,
                                            }}>
                                                {option.description}
                                            </Typography>
                                        </Box>
                                        {/* Always rendered — fading it in rather than mounting it
                                            keeps the card's text from reflowing on selection. */}
                                        <CheckRounded fontSize="small" aria-hidden sx={{
                                            color: 'secondary.dark',
                                            mt: 0.2,
                                            flexShrink: 0,
                                            opacity: selected ? 1 : 0,
                                            transition: 'opacity 0.15s ease',
                                        }}/>
                                    </ButtonBase>
                                )
                            })}
                        </Box>
                    </Box>
                </DialogContent>
                {/*{exportError ? <Alert severity="error">{exportErrorText}</Alert> : undefined}*/}
                <DialogActions sx={DIALOG_ACTIONS_SX}>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button type="submit" variant="contained" color="secondary">Send Invite</Button>
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