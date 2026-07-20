import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import {Logout, Settings, Sync} from "@mui/icons-material";
import {generateExport, logoutUserApi, syncTransactions} from "./Backend";
import triggerDownload from "./helpers/triggerDownload";
import {
    Alert,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle, FormControl, InputLabel, ListItemIcon, Select, SelectChangeEvent,
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
import {selectActiveUsers} from "./redux/clientSlice";

/*import {DatePicker} from '@mui/x-date-pickers/DatePicker';*/
interface MainAppBarProps {
    adminViewState: [boolean, React.Dispatch<React.SetStateAction<boolean>>]
}

const MainAppBar: React.FC<MainAppBarProps> = (props) => {
    const user = useAppSelector(selectUser)
    const isAdmin = useAppSelector(selectIsAdmin)
    const dispatch = useAppDispatch()
    const isMobile = useMediaQuery({maxWidth: 600})
    const users = useAppSelector(selectActiveUsers)
    const [exportCardNumber, setExportCardNumber] = useState<string | undefined>("")

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
        const startDate = formJson.start_date;
        const endDate = formJson.end_date;
        generateExport({start_date: startDate, end_date: endDate, user_card_number: exportCardNumber}).then(r => {
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

    const handleAdminViewChange = () => {
        props.adminViewState[1](prevState => !prevState);
    };

    const [exportError, setExportError] = useState<boolean>(false)
    const [exportErrorText, setExportErrorText] = useState<string>("")

    const initials = `${user?.first_name?.[0] ?? ""}${user?.last_name?.[0] ?? ""}`.toUpperCase()

    return (
        <AppBar position="static" color="primary">
            <Toolbar sx={{
                justifyContent: 'space-between',
                paddingY: 1,
                gap: 2,
                maxWidth: 'xl',
                width: '100%',
                mx: 'auto',
            }}>
                <Box sx={{display: 'flex', alignItems: 'center', gap: userIsAdmin && !isMobile ? 1.5 : 0}}>
                    <Box component="img" src="/logo192.png" alt=""
                         sx={{
                             width: 32,
                             height: 32,
                             borderRadius: '9px',
                             mr: 1.25,
                             border: '1px solid rgba(255, 255, 255, 0.18)',
                         }}/>
                    <Typography variant={isMobile ? "h5" : "h6"} noWrap component="div"
                                sx={{fontWeight: 800, letterSpacing: '0.02em', mr: 1.5, color: 'common.white'}}>
                        Sync
                    </Typography>
                    {!syncTransactionsLoading ? (
                        <Tooltip title="Sync transactions">
                            <IconButton sx={{color: 'common.white'}} onClick={() => {
                                setSyncTransactionsLoading(true)
                                syncTransactions().then(() => {
                                    dispatch(fetchAndClearTransactions({
                                        limit: 50,
                                        offset: 0,
                                        filters: props.adminViewState[0] ? {} : {user_card_number: user?.card_number}
                                    }))
                                }).catch(() => {
                                    handleSyncErrorOpen()
                                }).finally(() => {
                                    setSyncTransactionsLoading(false)
                                })
                            }}>
                                <Sync/>
                            </IconButton>
                        </Tooltip>) :
                        <CircularProgress size={'22px'} sx={{mx: 1, color: 'common.white'}}/>}
                    {userIsAdmin && !isMobile ?
                        <Button
                            onClick={handleClickOpen}
                            color="inherit"
                        >
                            Export
                        </Button> : undefined}

                    {userIsAdmin && !isMobile ? (
                            <Button variant={props.adminViewState[0] ? "contained" : "outlined"}
                                    onClick={handleAdminViewChange}
                                    sx={{
                                        color: props.adminViewState[0] ? 'primary.main' : 'common.white',
                                        bgcolor: props.adminViewState[0] ? 'common.white' : 'transparent',
                                        borderColor: 'common.white',
                                        '&:hover': {
                                            bgcolor: props.adminViewState[0] ? 'grey.100' : 'rgba(255, 255, 255, 0.08)',
                                            borderColor: 'common.white',
                                        },
                                    }}>
                                Admin View
                            </Button>)
                        : undefined}

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
                                    href={"mailto:support@quicksky.net"}
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
                            <DialogContent sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 2,
                                minWidth: {xs: 280, sm: 360},
                            }}>
                                <DialogContentText>
                                    Enter date range
                                </DialogContentText>
                                <Box sx={{display: 'flex', gap: 2}}>
                                    <DatePicker
                                        label="Start Date"
                                        name="start_date"
                                        format={"YYYY-MM-DD"}
                                        sx={{flex: 1}}
                                    />
                                    <DatePicker
                                        label="End Date"
                                        name="end_date"
                                        format={"YYYY-MM-DD"}
                                        sx={{flex: 1}}
                                    />
                                </Box>

                                <FormControl fullWidth color="secondary" variant="outlined">
                                    <InputLabel id="label-for-account">Account</InputLabel>
                                    <Select
                                        labelId="label-for-account"
                                        label="Account"
                                        defaultValue={""}
                                        onChange={(e: SelectChangeEvent<string | undefined>) => setExportCardNumber(e.target.value)}>
                                        <MenuItem key={-1} value={undefined}>{"<none>"}</MenuItem>
                                        {users.map(user => (
                                            <MenuItem key={user.id}
                                                      value={user.card_number ? user.card_number : ""}>{user.first_name} {user.last_name} - {user.card_number}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </DialogContent>
                            {exportError ? <Alert severity="error">{exportErrorText}</Alert> : undefined}
                            <DialogActions>
                                <Button onClick={handleClose}>Cancel</Button>
                                <Button type="submit" variant="contained" color="secondary">Export</Button>
                            </DialogActions>
                        </Dialog>
                </Box>
                <Box sx={{display: 'flex', alignItems: 'center'}}>
                    <Tooltip title="Account">
                        <IconButton onClick={handleOpenUserMenu} sx={{p: 0}}>
                            <Avatar sx={{bgcolor: 'common.white', color: 'primary.main', fontWeight: 700, width: 36, height: 36, fontSize: 14}}>
                                {initials || undefined}
                            </Avatar>
                        </IconButton>
                    </Tooltip>
                    <Menu
                        sx={{mt: 1}}
                        id="menu-appbar"
                        anchorEl={anchorElUser}
                        anchorOrigin={{
                            vertical: 'bottom',
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
                            <MenuItem onClick={() => {
                                handleCloseUserMenu()
                                navigate("/settings")
                            }}>
                                <ListItemIcon><Settings fontSize="small"/></ListItemIcon>
                                Settings
                            </MenuItem>
                        )}
                        <MenuItem
                            onClick={() => {
                                logoutUserApi().then(() => {
                                    navigate("/");
                                }).catch(() => {
                                    handleCloseUserMenu();
                                });
                            }}
                        >
                            <ListItemIcon><Logout fontSize="small"/></ListItemIcon>
                            Logout
                        </MenuItem>
                    </Menu>
                </Box>
            </Toolbar>
        </AppBar>
    );
}

export default MainAppBar;