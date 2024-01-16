import React from 'react';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import {Button} from "@mui/material";

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

export default function SettingsPage() {
    const [value, setValue] = React.useState(0);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    return (
        <Box sx={{display: 'flex'}}>
            <Tabs
                orientation="vertical"
                variant="scrollable"
                value={value}
                onChange={handleChange}
                sx={{borderRight: 1, borderColor: 'divider'}}
            >
                <Tab label="Accounts"/>
                <Tab label="Users"/>
                <Tab label="Plaid Link"/>
            </Tabs>
            <TabPanel value={value} index={0}>
                Accounts
            </TabPanel>
            <TabPanel value={value} index={1}>
                Users
            </TabPanel>
            <TabPanel value={value} index={2}>
                Plaid Link
            </TabPanel>
            {/* Add more panels as needed */}
        </Box>
    );
}
