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
    DialogTitle, Drawer, FormControlLabel, Switch,
    TextField
} from "@mui/material";
import {useAppDispatch, useAppSelector} from "./redux/store";
import {selectIsAdmin, selectUser} from "./redux/userSlice";
import {useState} from "react";
import {useNavigate} from "react-router-dom";
import {fetchAndClearTransactions, fetchTransactions} from "./redux/transactionSlice";
import {LoadingSpinner} from "plaid-threads";
import DateInput from "plaid-threads/DateInput";
import {DatePicker} from "@mui/x-date-pickers";
import {useMediaQuery} from "react-responsive"

/*import {DatePicker} from '@mui/x-date-pickers/DatePicker';*/
interface MainAppBarProps {
    adminViewState: [boolean, React.Dispatch<React.SetStateAction<boolean>>]
}

const MainAppBar: React.FC<MainAppBarProps> = (props) => {
    const user = useAppSelector(selectUser)
    const isAdmin = useAppSelector(selectIsAdmin)
    const dispatch = useAppDispatch()
    const isMobile = useMediaQuery({maxWidth: 500} )

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

    const handleAdminViewChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        props.adminViewState[1](event.target.checked);
    };

    const [exportError, setExportError] = useState<boolean>(false)
    const [exportErrorText, setExportErrorText] = useState<string>("")


    return (
        <Box sx={{display: 'flex', flexDirection: 'column'}}>
            <Drawer
                variant="permanent"
                sx={{
                    width: '100%',
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: '100%',
                        boxSizing: 'border-box',
                        backgroundColor: '#20202e', // Change the background color here
                        color: '#fff', // This changes the text color inside the drawer
                    },
                }}
                anchor="top"
            >
                <Container maxWidth="xl"
                           sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingY: 1}}>
                    <Box sx={{display: 'flex', alignItems: 'center', maxHeight: 2, marginY: '5px'}}>
                        {!syncTransactionsLoading ? (<IconButton onClick={() => {
                                setSyncTransactionsLoading(true)
                                syncTransactions().then(() => {
                                    dispatch(fetchAndClearTransactions({limit: 50, offset: 0}))
                                }).catch(() => {
                                    handleSyncErrorOpen()
                                }).finally(() => {
                                    setSyncTransactionsLoading(false)
                                })
                            }}>
                            <Sync sx={{ color: 'primary.main' }}/>
                        </IconButton>) : <CircularProgress sx={{ transform: 'scaleX(-1) rotate(-90deg)' }} size={'30px'} /> }
                        <Typography variant={isMobile ? "h4" : "h6"} noWrap component="div">
                            SYNC
                        </Typography>
                        {userIsAdmin && !isMobile ?
                            <Button
                                onClick={handleClickOpen}
                                sx={{my: 2, color: 'white', display: 'block'}}
                            >
                                Export
                            </Button> : undefined}
                        {userIsAdmin && !isMobile ? (<FormControlLabel
                            control={<Switch checked={props.adminViewState[0]} onChange={handleAdminViewChange}/>}
                            label="Admin View"/>) : undefined}

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
                                <Button onClick={handleSyncErrorClose} variant="contained" color="secondary">Ok</Button>
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
                                <Button onClick={handleClose} color="secondary">Cancel</Button>
                                <Button type="submit" variant="contained" color="secondary">Export</Button>
                            </DialogActions>
                        </Dialog>
                    </Box>
                    <Box sx={{display: 'flex', alignItems: 'left', marginY: '5px'}}>
                        <Tooltip title="Open settings">
                            <IconButton onClick={handleOpenUserMenu} sx={{p: 0, marginLeft: 2}}>
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
                            {isAdmin && (
                                <Button
                                    onClick={() => navigate("/settings")}
                                    sx={{color: 'black', display: 'block'}}
                                >
                                    Settings
                                </Button>
                            )}
                            <Button
                                onClick={() => {
                                    logoutUserApi().then(() => {
                                        navigate("/");
                                    }).catch(() => {
                                        handleCloseUserMenu();
                                    });
                                }}
                                sx={{color: 'black', display: 'block'}}
                            >
                                Logout
                            </Button>
                        </Menu>
                    </Box>
                </Container>
            </Drawer>
            <Box component="main" sx={{flexGrow: 1, p: 3}}>

            </Box>
        </Box>
    );
}

export default MainAppBar;