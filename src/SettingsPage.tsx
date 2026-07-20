import React, {useEffect, useState} from 'react';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import {useAppDispatch, useAppSelector} from "./redux/store";
import {
    fetchClientAccounts,
    selectClientAccounts,
} from "./redux/accountSlice";
import IconButton from '@mui/material/IconButton';
import {
    fetchClientExcelMapping,
    fetchUserList,
    fetchVendorList,
    selectExcelMapping
} from "./redux/clientSlice";
import {
    Drawer,
    Typography
} from "@mui/material";
import {useLocation, useNavigate} from "react-router-dom";
import {AccountBalance, ArrowBack, MailOutline, People, Storefront, Link as LinkIcon} from "@mui/icons-material";
import AccountsPanel from "./SettingsComponents/Accounts"
import VendorsPanel from "./SettingsComponents/Vendors";
import UsersPanel from "./SettingsComponents/Users";
import ExportsPanel from "./SettingsComponents/Exports";
import PlaidPanel from "./SettingsComponents/Plaid";

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
    const navigate = useNavigate();
    const location = useLocation();

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

    useEffect(() => {
        dispatch(fetchClientAccounts())
        dispatch(fetchUserList())
        dispatch(fetchVendorList())
        dispatch(fetchClientExcelMapping())
    }, [dispatch])

    useEffect(() => {
        setValue(getTabValue());
    }, [location.search]);

    return (
        <Box sx={{display: 'flex'}}>
            <Drawer
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                        overflowX: 'hidden',
                        backgroundColor: 'background.paper',
                    },
                }}
                variant="permanent"
                anchor="left"
            >
                <Box sx={{display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 2.5}}>
                    <IconButton onClick={() => navigate("/home")} size="small">
                        <ArrowBack fontSize="small"/>
                    </IconButton>
                    <Typography variant="subtitle1" fontWeight={700}>Settings</Typography>
                </Box>

                <Tabs
                    orientation="vertical"
                    value={value}
                    onChange={handleChange}
                    TabIndicatorProps={{sx: {display: 'none'}}}
                    sx={{
                        px: 1.5,
                        "& .MuiTab-root": {
                            alignItems: 'center',
                            justifyContent: 'flex-start',
                            textAlign: 'left',
                            minHeight: 44,
                            borderRadius: 2,
                            mb: 0.5,
                            pl: 1.5,
                            color: 'text.secondary',
                            fontWeight: 600,
                        },
                        "& .MuiTab-iconWrapper": {marginRight: 1.5},
                        "& .Mui-selected": {
                            backgroundColor: 'secondary.light',
                            color: 'primary.main',
                            fontWeight: 700,
                        },
                    }}
                >
                    <Tab icon={<AccountBalance fontSize="small"/>} iconPosition="start" label="Accounts"/>
                    <Tab icon={<Storefront fontSize="small"/>} iconPosition="start" label="Vendors"/>
                    <Tab icon={<People fontSize="small"/>} iconPosition="start" label="Users"/>
                    <Tab icon={<LinkIcon fontSize="small"/>} iconPosition="start" label="Plaid Link"/>
                </Tabs>

            </Drawer>
            <Box
                component="main"
                sx={{flexGrow: 1, bgcolor: 'background.default', p: 3}}
            >

                {/*ACCOUNT PANEL*/}
                <TabPanel value={value} index={0}>
                    <AccountsPanel/>
                </TabPanel>

                {/*VENDOR PANEL*/}
                <TabPanel value={value} index={1}>
                    <VendorsPanel/>
                </TabPanel>

                {/* EXPORT PANEL*/}
                {/*<TabPanel index={2} value={value}>*/}
                {/*    /!*<Exports mapping={excelMapping}/>*!/*/}
                {/*    <Exports/>*/}
                {/*</TabPanel>*/}

                {/*USERS PANEL*/}
                <TabPanel value={value} index={2}>
                    <UsersPanel/>
                </TabPanel>

                {/*PLAID PANEL*/}
                <TabPanel value={value} index={3}>
                    <PlaidPanel/>
                </TabPanel>
            </Box>
        </Box>
    );
}

export default SettingsPage