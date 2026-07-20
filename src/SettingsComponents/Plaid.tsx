import React from 'react';
import {
    Typography,
    Paper,
} from '@mui/material';
import Box from "@mui/material/Box"; // Adapt these imports to your project structure
import Link from "../Link";

const PlaidPanel: React.FC = () => {
    return (
        <>
            <Paper elevation={1} sx={{width: "75%", maxWidth: 600, mx: 'auto', p: 3}}>
                <Typography variant="h6" fontWeight={700} sx={{mb: 0.5}}>Plaid Link</Typography>
                <Typography variant="body2" color="text.secondary" sx={{mb: 3}}>
                    Connect or reauthorize the card account used to sync transactions.
                </Typography>
                <Box sx={{display: 'flex', gap: 2}}>
                    <Link repair={false}/>
                    <Link repair={true}/>
                </Box>
            </Paper>
        </>
    );
};

export default PlaidPanel;
