import React, {useEffect, useState} from 'react';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import {useAppDispatch, useAppSelector} from "./redux/store";
import {
    Account,
    fetchClientAccounts,
    selectClientAccounts,
} from "./redux/accountSlice";
import Link from "./Link";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import {
    fetchClientExcelMapping,
    fetchUserList,
    fetchVendorList,
    selectActiveUsers, selectExcelMapping,
    selectPendingUsers
} from "./redux/clientSlice";
import {
    addClientAccounts,
    createUser,
    deleteClientAccount,
    getUserAccounts,
    grantAccount, reInviteUser,
    revokeAccount
} from "./Backend";
import {
    Button, Checkbox, CssBaseline,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle, Drawer, FormControlLabel, List, ListItem,
    TableContainer,
    TextField,
    Typography
} from "@mui/material";
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import AppBar from "@mui/material/AppBar";
import {useLocation, useNavigate} from "react-router-dom";
import {ArrowBack, MailOutline} from "@mui/icons-material";
import Vendors from "./SettingsComponents/Vendors";
import Exports from "./SettingsComponents/Exports";
import {SyncConfirmationDialog} from './components/SyncConfirmationDialog';


const drawerWidth = 240

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const {children, value, index, ...other} = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{p: 3}}>
                    {children}
                </Box>
            )}
        </div>
    );
}

const SettingsPage: React.FC = () => {
    const [value, setValue] = React.useState(0);
    const dispatch = useAppDispatch()
    const accounts = useAppSelector(selectClientAccounts)
    const activeUsers = useAppSelector(selectActiveUsers)
    const pendingUsers = useAppSelector(selectPendingUsers)
    const [checkboxDialogUserId, setCheckboxDialogUserId] = useState<string>("")
    const [addAccountText, setAddAccountText] = useState("")
    const [inviteUserAdmin, setInviteUserAdmin] = useState<boolean>(false)
    const [userAccounts, setUserAccounts] = useState<Account[]>([])
    const navigate = useNavigate();
    const location = useLocation();
    const [resendUserInviteDialogOpen, setResendUserInviteDialogOpen] = useState<boolean>(false)
    const [userId, setUserId] = useState<string>("")
    const excelMapping = useAppSelector(selectExcelMapping);

    const getTabValue = () => {
        const searchParams = new URLSearchParams(location.search);
        const tab = searchParams.get('tab');
        switch (tab) {
            case 'accounts':
                return 0;
            case 'vendors':
                return 1;
            // case 'exports':
            //     return 2
            case 'users':
                return 2;
            case 'plaid':
                return 3;
            default:
                return 0;
        }
    }

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
        const tabParam = ['accounts', 'vendors', 'users', 'plaid'][newValue] || 'accounts';
        navigate(`?tab=${tabParam}`);
    };

    const handleDelete = (id: number) => {
        deleteClientAccount(id).then(() => {
            dispatch(fetchClientAccounts())
        })
    }

    const handleAddAccounts = () => {
        addClientAccounts(addAccountText).then(() => {
            dispatch(fetchClientAccounts())
            handleClose()
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

    const [open, setOpen] = React.useState(false);
    const [openCheckboxDialog, setOpenCheckboxDialog] = React.useState(false);

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

    const handleCloseCheckboxDialog = () => {
        setOpenCheckboxDialog(false)
    }

    useEffect(() => {
        dispatch(fetchClientAccounts())
        dispatch(fetchUserList())
        dispatch(fetchVendorList())
        dispatch(fetchClientExcelMapping())
    }, [dispatch])

    useEffect(() => {
        setValue(getTabValue());
    }, [location.search]);

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
        <Box sx={{display: 'flex'}}>
            <CssBaseline/>
            <AppBar
                position="fixed"
                sx={{width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px`}}
            >
            </AppBar>
            <Drawer
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                        overflowX: 'hidden',
                    },
                }}
                variant="permanent"
                anchor="left"
            >
                {/*<Toolbar />*/}
                {/*<Divider />*/}
                <IconButton onClick={() => navigate("/home")}><ArrowBack/></IconButton>

                <Tabs
                    textColor="primary"
                    indicatorColor="primary"
                    orientation="vertical"
                    value={value}
                    onChange={handleChange}
                    sx={{
                        width: drawerWidth,
                        "& button.Mui-selected": {backgroundColor: "secondary.main"},
                    }}
                >
                    <Tab label="Accounts"/>
                    <Tab label="Vendors"/>
                    {/*<Tab label="Exports"/>*/}
                    <Tab label="Users"/>
                    <Tab label="Plaid Link"/>
                </Tabs>

            </Drawer>
            <Box
                component="main"
                sx={{flexGrow: 1, bgcolor: 'background.default', p: 3}}
            >

                {/*ACCOUNT PANEL*/}
                <TabPanel value={value} index={0}>
                    <TableContainer component={Paper}
                                    sx={{width: "50%", justifyContent: 'center', mx: 'auto', height: '85vh'}}>
                        <Table sx={{
                            width: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            mx: 'auto'
                        }} aria-label="simple table">
                            <TableHead>
                                <TableRow sx={{borderBottom: '2px solid'}}>
                                    <TableCell align="left" width="90%" sx={{fontWeight: 'bold'}}>Available
                                        Accounts</TableCell>
                                    <TableCell align="right" width="10%">
                                        <IconButton aria-label="add" size="large" color="success"
                                                    onClick={handleClickOpen}>
                                            <AddIcon fontSize="inherit"/>
                                        </IconButton>
                                        <Dialog
                                            open={open}
                                            onClose={handleClose}
                                            PaperProps={{
                                                component: 'form',
                                            }}
                                        >
                                            <DialogTitle color="secondary">Add Accounts</DialogTitle>
                                            <DialogContent>
                                                <TextField
                                                    onChange={(e) => setAddAccountText(e.target.value)}
                                                    color="secondary"
                                                    focused
                                                    required
                                                    margin="dense"
                                                    label="Enter account names"
                                                    multiline
                                                    rows={4}
                                                />
                                            </DialogContent>
                                            <DialogActions>
                                                <Button onClick={handleClose} color="secondary">Cancel</Button>
                                                <Button onClick={handleAddAccounts} variant="contained"
                                                        color="secondary">Add</Button>
                                            </DialogActions>
                                        </Dialog>
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {accounts.map((account) => (
                                    <TableRow
                                        key={account.id}
                                        sx={{'&:last-child td, &:last-child th': {border: 0}}}
                                    >
                                        <TableCell align="left" width="90%">
                                            {<div style={{wordBreak: 'break-all'}}>{account.name}</div>}
                                        </TableCell>
                                        <TableCell align="right" width="10%">
                                            <IconButton onClick={() => handleDelete(account.id)} aria-label="delete"
                                                        size="large" color="error">
                                                <RemoveIcon fontSize="inherit"/>
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </TabPanel>
                {/*VENDOR PANEL*/}
                <TabPanel value={value} index={1}>
                    <Vendors/>
                </TabPanel>

                {/* EXPORT PANEL*/}
                {/*<TabPanel index={2} value={value}>*/}
                {/*    /!*<Exports mapping={excelMapping}/>*!/*/}
                {/*    <Exports/>*/}
                {/*</TabPanel>*/}

                {/*USERS PANEL*/}
                <TabPanel value={value} index={2}>
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
                    {/*{activeUsers.map((user) => (*/}
                    {/*    <Typography>*/}
                    {/*        {user.first_name}*/}
                    {/*    </Typography>*/}
                    {/*))}*/}
                    <Box display="flex" justifyContent="flex-end">
                        <Button variant="contained" sx={{mb: 1}} onClick={handleClickOpen}
                        >
                            Invite User
                        </Button>
                    </Box>
                    <TableContainer component={Paper}>
                        <Table sx={{minWidth: 250}} aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <TableCell align="left">First Name</TableCell>
                                    <TableCell align="right">Last Name</TableCell>
                                    <TableCell align="right">Email</TableCell>
                                    <TableCell align="right">Card Number</TableCell>
                                    <TableCell align="right">Role</TableCell>
                                    <TableCell align="center">Status</TableCell>
                                    <TableCell align="center">Accounts</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {activeUsers.concat(pendingUsers).map((user) => (
                                    <TableRow
                                        key={user.id}
                                        sx={{'&:last-child td, &:last-child th': {border: 0}}}
                                    >
                                        <TableCell component="th" scope="row">
                                            {user.first_name}
                                        </TableCell>
                                        <TableCell align="right">{user.last_name}</TableCell>
                                        <TableCell align="right">{user.email}</TableCell>
                                        <TableCell align="right">{user.card_number}</TableCell>
                                        <TableCell align="right">{user.role > 1 ? "Admin" : "User"}</TableCell>
                                        <TableCell
                                            align="center"
                                        >{pendingUsers.map((user) => user.id).includes(user.id) ? (
                                            <>
                                                <Typography justifySelf={"center"} fontSize={14}
                                                >Pending</Typography>
                                                <IconButton onClick={() => {
                                                    setUserId(user.id)
                                                    setResendUserInviteDialogOpen(true)
                                                }} size={'large'}><MailOutline/></IconButton>
                                            </>) : "Active"}</TableCell>
                                        <TableCell align="center">
                                            {user.role > 1 ?
                                                <IconButton disabled={true}>
                                                    <EditIcon/>
                                                </IconButton>
                                                :
                                                <IconButton onClick={() => handleOpenCheckboxDialog(user.id)}>
                                                    <EditIcon/>
                                                </IconButton>
                                            }
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>


                    {/*Invite Users Dialog*/}
                    <Dialog
                        open={open}
                        onClose={handleClose}
                        PaperProps={{
                            component: 'form',
                            onSubmit: onUserInviteSubmit,
                        }}
                    >
                        <DialogTitle color="secondary">Enter User Information</DialogTitle>
                        <DialogContent>
                            <TextField
                                focused
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
                                focused
                                color="secondary"
                                margin="dense"
                                label="Last Name"
                                name="last_name"
                                id="last_name"
                                fullWidth
                                variant="standard"
                            />
                            <TextField
                                focused
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
                                focused
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
                                    "&, & + .MuiFormControlLabel-label": {
                                        color: "secondary.main"
                                    }
                                }} color="secondary" checked={inviteUserAdmin}
                                                   onChange={(evt) => setInviteUserAdmin(evt.target.checked)}/>}
                                label="Admin"
                                name="is_admin"
                                id="is_admin"
                            />
                        </DialogContent>
                        {/*{exportError ? <Alert severity="error">{exportErrorText}</Alert> : undefined}*/}
                        <DialogActions>
                            <Button onClick={handleClose} color="secondary">Cancel</Button>
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
                        <DialogTitle color="secondary">Edit User Accounts</DialogTitle>
                        <DialogContent>
                            <List dense sx={{minWidth: 300, maxWidth: 800, height: '65vh'}}>
                                {accounts.map((account) => (
                                    <ListItem key={account.id}>
                                        <FormControlLabel
                                            control={
                                                <Checkbox sx={{
                                                    "&, & + .MuiFormControlLabel-label": {
                                                        color: "secondary.main"
                                                    }
                                                }} color="secondary"
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
                            <Button onClick={handleCloseCheckboxDialog} color="secondary">Close</Button>
                        </DialogActions>
                    </Dialog>

                </TabPanel>

                {/*PLAID PANEL*/}
                <TabPanel value={value} index={3}>
                    <Link repair={false}/>
                    <Link repair={true}/>
                </TabPanel>
            </Box>
        </Box>
    );
}

export default SettingsPage