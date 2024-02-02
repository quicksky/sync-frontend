import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import {Sync} from "@mui/icons-material";
import {generateExport, logoutUserApi, syncTransactions} from "./Backend";
import triggerDownload from "./triggerDownload";
import {
    Alert,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    TextField
} from "@mui/material";
import {useAppDispatch, useAppSelector} from "./redux/store";
import {selectIsAdmin, selectUser} from "./redux/userSlice";
import {useState} from "react";
import {useNavigate} from "react-router-dom";
import {fetchTransactions} from "./redux/transactionSlice";
import {LoadingSpinner} from "plaid-threads";
import DateInput from "plaid-threads/DateInput";
import {DatePicker} from "@mui/x-date-pickers";

/*import {DatePicker} from '@mui/x-date-pickers/DatePicker';*/


function MainAppBar() {
    const user = useAppSelector(selectUser)
    const isAdmin = useAppSelector(selectIsAdmin)
    const dispatch = useAppDispatch()

    const navigate = useNavigate();
    const userIsAdmin = user && user.role > 1
    const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);


    const [syncTransactionsLoading, setSyncTransactionsLoading] = useState<boolean>(false)
    const [syncErrorAlertOpen, setSyncErrorAlertOpen] = useState<boolean>(false);
    const syncErrorMessage = userIsAdmin ?
        "Please reconnect your credit card account in the settings page. If that does not resolve the issue, reach out to " :
        "Please contact your administrator to resolve this issue"

    const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
        setExportError(false)
    };

    const handleClose = () => {
        setOpen(false);
        setExportError(false)
    };

    const handleSyncErrorOpen = () => {
        setSyncErrorAlertOpen(true)
    }
    const handleSyncErrorClose = () => {
        setSyncErrorAlertOpen(false)
    }

    const onExportSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const formJson = Object.fromEntries((formData as any).entries());
        console.log(formJson)
        const startDate = formJson.start_date;
        const endDate = formJson.end_date;
        generateExport({start_date: startDate, end_date: endDate}).then(r => {
            triggerDownload(new Blob([r.data]), r.fileName)
            handleClose();
        }).catch(e => {
            if (e.code === "ERR_BAD_REQUEST") {
                setExportError(true)
                setExportErrorText("Dates are not in the correct format")
            } else {
                setExportError(true)
                setExportErrorText("Server error")
            }
        })
    }

    const [exportError, setExportError] = useState<boolean>(false)
    const [exportErrorText, setExportErrorText] = useState<string>("")


    return (
        <AppBar position="static" sx={{backgroundColor: '#050A30'}}>
            <Container maxWidth="xl">
                <Toolbar disableGutters>
                    <Sync></Sync>
                    <Typography
                        variant="h6"
                        noWrap
                        component="a"
                        sx={{
                            mr: 2,
                            display: {xs: 'none', md: 'flex'},
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            letterSpacing: '.3rem',
                            color: 'inherit',
                            textDecoration: 'none',
                        }}
                    >
                        SYNC
                    </Typography>
                    <Typography
                        variant="h5"
                        noWrap
                        component="a"
                        sx={{
                            mr: 2,
                            display: {xs: 'flex', md: 'none'},
                            flexGrow: 1,
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            letterSpacing: '.3rem',
                            color: '#ffffff',
                            textDecoration: 'none',
                        }}
                    >
                        SYNC
                    </Typography>
                    <Box sx={{flexGrow: 1, display: {xs: 'none', md: 'flex'}}}>
                        {userIsAdmin ?
                            <Button
                                onClick={handleClickOpen}
                                sx={{my: 2, color: 'white', display: 'block'}}
                            >
                                Export
                            </Button> : undefined}
                        {!syncTransactionsLoading ? (<Button onClick={() => {
                            setSyncTransactionsLoading(true)
                            syncTransactions().then(() => {
                                dispatch(fetchTransactions(isAdmin))
                            }).catch(() => {
                                handleSyncErrorOpen()
                            }).finally(() => {
                                setSyncTransactionsLoading(false)
                            })
                        }}>
                            REFRESH BUTTON (MIGHT FAIL)
                        </Button>) : <CircularProgress/>}
                        <Dialog
                            open={syncErrorAlertOpen}
                            onClose={handleSyncErrorClose}
                            aria-labelledby="alert-dialog-title"
                            aria-describedby="alert-dialog-description"
                        >
                            <DialogTitle id="alert-dialog-title">
                                {"Error Syncing Transactions"}
                            </DialogTitle>
                            <DialogContent>
                                <DialogContentText id="alert-dialog-description">
                                    {syncErrorMessage} {userIsAdmin ? <a
                                    href={"mailto:support@quicksky.net&subject=Sync%20Transactions%20Error"}
                                    target="_blank">support@quicksky.net</a> : undefined}
                                </DialogContentText>
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={handleSyncErrorClose}>Ok</Button>
                            </DialogActions>
                        </Dialog>

                        <Dialog
                            open={open}
                            onClose={handleClose}
                            PaperProps={{
                                component: 'form',
                                onSubmit: onExportSubmit,
                            }}
                        >
                            <DialogTitle>Export Transactions to Excel</DialogTitle>
                            <DialogContent>
                                <DialogContentText>
                                    Enter date range
                                </DialogContentText>
                                {/*<TextField*/}
                                {/*    autoFocus*/}
                                {/*    required*/}
                                {/*    margin="dense"*/}
                                {/*    label="Start Date"*/}
                                {/*    name="start_date"*/}
                                {/*    id="start_date"*/}
                                {/*    fullWidth*/}
                                {/*    variant="standard"*/}
                                {/*/>*/}
                                <DatePicker
                                    label="Start Date"
                                    name="start_date"
                                    format={"YYYY-MM-DD"}
                                ></DatePicker>

                                <DatePicker
                                    label="End Date"
                                    name="end_date"
                                    format={"YYYY-MM-DD"}></DatePicker>

                            </DialogContent>
                            {exportError ? <Alert severity="error">{exportErrorText}</Alert> : undefined}
                            <DialogActions>
                                <Button onClick={handleClose}>Cancel</Button>
                                <Button type="submit">Export</Button>
                            </DialogActions>
                        </Dialog>

                    </Box>

                    <Box sx={{flexGrow: 0}}>
                        <Tooltip title="Open settings">
                            <IconButton onClick={handleOpenUserMenu} sx={{p: 0}}>
                                <Avatar alt={user?.first_name} src="/static/images/avatar/2.jpg"/>
                            </IconButton>
                        </Tooltip>
                        <Menu
                            sx={{mt: '45px'}}
                            id="menu-appbar"
                            anchorEl={anchorElUser}
                            anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            open={Boolean(anchorElUser)}
                            onClose={handleCloseUserMenu}
                        >
                            {isAdmin ? (<MenuItem key="Settings" onClick={() => {
                                navigate("/settings")
                            }}>
                                <Typography textAlign="center">Settings</Typography>
                            </MenuItem>) : undefined}


                            <MenuItem key="Logout" onClick={() => {
                                logoutUserApi().then(() => {
                                    navigate("/")
                                    //use dispatch to set logout state to get text on login screen
                                }).catch(() => {
                                    handleCloseUserMenu()
                                })
                            }}>
                                <Typography textAlign="center">Logout</Typography>
                            </MenuItem>

                        </Menu>
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
}

export default MainAppBar;