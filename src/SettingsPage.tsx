import React, {useEffect, useState} from 'react';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import {Button, Typography} from "@mui/material";
import {useAppDispatch, useAppSelector} from "./redux/store";
import {Account, fetchUserAccounts, selectAccounts} from "./redux/accountSlice";
import {Route} from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import Link from "./Link";

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
    const accounts = useAppSelector(selectAccounts)


    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    useEffect(() => {
        dispatch(fetchUserAccounts())
    }, [dispatch])

    return (
        <Box sx={{display: 'flex', height: "100vh"}}>
            <Tabs
                orientation="vertical"
                variant="scrollable"
                value={value}
                onChange={handleChange}
                sx={{
                    borderRight: 1,
                    borderColor: 'divider',
                    backgroundColor: '#f5f5f5',
                    width: '200px',
                }}
            >
                <Tab label="Accounts"/>
                <Tab label="Users"/>
                <Tab label="Plaid Link"/>
            </Tabs>
            <TabPanel value={value} index={0}>
                {accounts.map(a => a.name)}
            </TabPanel>
            <TabPanel value={value} index={1}>
                Users
            </TabPanel>
            <TabPanel value={value} index={2}>
                <Link repair={false}/>
                <Link repair={true}/>

            </TabPanel>
            {/* Add more panels as needed */}
        </Box>
    );
}

export default SettingsPage
