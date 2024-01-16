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
import {generateExport, logoutUserApi} from "./Backend";
import triggerDownload from "./triggerDownload";
import {Alert, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField} from "@mui/material";
import {useAppSelector} from "./redux/store";
import {selectUser} from "./redux/userSlice";
import {useState} from "react";
import {useNavigate} from "react-router-dom";


function MainAppBar() {
    const user = useAppSelector(selectUser)
    const navigate = useNavigate();
    const userIsAdmin = user && user.role > 1
    const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);

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

    const onExportSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const formJson = Object.fromEntries((formData as any).entries());
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
                            color: '#050A30',
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
                                <TextField
                                    autoFocus
                                    required
                                    margin="dense"
                                    label="Start Date"
                                    name="start_date"
                                    id="start_date"
                                    fullWidth
                                    variant="standard"
                                />
                                <TextField
                                    required
                                    margin="dense"
                                    label="End Date"
                                    name="end_date"
                                    id="end_date"
                                    fullWidth
                                    variant="standard"
                                />

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
                                <Avatar alt="wemy Sharp" src="/static/images/avatar/2.jpg"/>
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
                            <MenuItem key="Settings" onClick={() => {
                                navigate("/settings")
                            }}>
                                <Typography textAlign="center">Settings</Typography>
                            </MenuItem>

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