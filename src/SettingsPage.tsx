import React, {useEffect, useState} from 'react';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import {useAppDispatch, useAppSelector} from "./redux/store";
import {
    Account,
    fetchClientAccounts,
    fetchOwnAccounts, fetchUserAccounts,
    selectClientAccounts,
    selectOwnAccounts, selectUserAccounts
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
import {fetchUserList, selectActiveUsers, selectPendingUsers} from "./redux/clientSlice";
import {
    addClientAccounts,
    createUser,
    deleteClientAccount,
    getUserAccounts,
    grantAccount,
    revokeAccount
} from "./Backend";
import {
    Alert,
    Button, Checkbox, CssBaseline,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle, Divider, Drawer, FormControlLabel, List, ListItem, ListItemText,
    TableContainer,
    TextField,
    Typography
} from "@mui/material";
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";


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
    const [checkboxDialogUserId, setCheckboxDialogUserId] = useState<string>("")
    const [addAccountText, setAddAccountText] = useState("")
    const [inviteUserAdmin, setInviteUserAdmin] = useState<boolean>(false)
    const [accountPermissionLoading, setAccountPermissionLoading] = React.useState(false)
    const userAccounts = useAppSelector(selectUserAccounts)

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
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
        setAccountPermissionLoading(true)
        checked ? grantAccount({user_id: user_id, account_id: account_id}).then(() => {
            setAccountPermissionLoading(false)
        }) :  revokeAccount({user_id: user_id, account_id: account_id}).then(() => {
            setAccountPermissionLoading(false)
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
        dispatch(fetchUserAccounts(user_id)).then(() =>{
            console.log(userAccounts)
            setOpenCheckboxDialog(true)
        })
    }

    const handleCloseCheckboxDialog = () => {
        setOpenCheckboxDialog(false)
    }

    useEffect(() => {
        dispatch(fetchClientAccounts())
        dispatch(fetchUserList())
    }, [dispatch])

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
                    },
                }}
                variant="permanent"
                anchor="left"
            >
                {/*<Toolbar />*/}
                {/*<Divider />*/}

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
                                            {<div style={{ wordBreak: 'break-all' }}>{account.name}</div>}
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


                {/*USERS PANEL*/}
                <TabPanel value={value} index={1}>
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
                                    <TableCell align="right">Accounts</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {activeUsers.map((user) => (
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
                                        <TableCell align="right">
                                            <IconButton onClick={() => handleOpenCheckboxDialog(user.id)}>
                                                <EditIcon />
                                            </IconButton>
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
                        <DialogTitle color="secondary">Check User Accounts</DialogTitle>
                        <DialogContent>
                            <List dense sx={{ minWidth: 300, maxWidth: 800, height: '65vh' }}>
                                {accounts.map((account) => (
                                    <ListItem key = {account.id}>
                                        <FormControlLabel
                                            control={<Checkbox sx={{
                                                "&, & + .MuiFormControlLabel-label": {
                                                    color: "secondary.main"
                                                }
                                            }} color="secondary" checked={userAccounts.includes(account)}
                                                               onChange={(evt) => onAccountCheckboxClick(evt.target.checked, account.id, checkboxDialogUserId)}/>}
                                            label={<div style={{ wordBreak: 'break-all' }}>{account.name}</div>}
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
                <TabPanel value={value} index={2}>
                    <Link repair={false}/>
                    <Link repair={true}/>
                </TabPanel>
            </Box>
        </Box>
    );
}

export default SettingsPage