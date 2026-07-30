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
            <Paper elevation={1} sx={{width: "75%", maxWidth: 600, mx: 'auto', p: 3, flexShrink: 0}}>
                <Box sx={{display: 'flex', alignItems: 'center', gap: 1.25, mb: 0.5}}>
                    <Box sx={{
                        width: 4,
                        height: 22,
                        borderRadius: 2,
                        backgroundImage: 'linear-gradient(180deg, #D9BF95 0%, #A67C42 100%)',
                    }}/>
                    <Typography variant="h6" fontWeight={700}>Plaid Link</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{mb: 3, ml: '17px'}}>
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
