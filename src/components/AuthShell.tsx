import React from 'react';
import {Box, Paper, Typography} from '@mui/material';
import {GRADIENT_GOLD} from '../App';

interface AuthShellProps {
    title: string;
    subtitle?: string;
    error?: string;
    children: React.ReactNode;
    variant?: 'brand' | 'compact';
}

// Deep navy canvas with a single white card floating on it: the card is the only
// bright object on the page, and gold appears as a hairline accent rather than a wash.
const CANVAS =
    'radial-gradient(760px 620px at 50% 42%, rgba(255, 255, 255, 0.07) 0%, rgba(255, 255, 255, 0) 68%), ' +
    'radial-gradient(900px 640px at 8% -12%, rgba(217, 191, 149, 0.16) 0%, rgba(217, 191, 149, 0) 62%), ' +
    'radial-gradient(820px 620px at 102% 108%, rgba(60, 85, 122, 0.38) 0%, rgba(60, 85, 122, 0) 64%), ' +
    'linear-gradient(160deg, #1B2A47 0%, #0E1B30 52%, #070E1B 100%)';

const CARD_SHADOW = '0 32px 72px rgba(3, 8, 18, 0.55), 0 10px 24px rgba(3, 8, 18, 0.35)';

const AuthShell: React.FC<AuthShellProps> = ({title, subtitle, error, children, variant = 'compact'}) => {
    const isBrand = variant === 'brand';

    return (
        <Box sx={{
            minHeight: '100vh',
            width: '100%',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            px: 2,
            background: CANVAS,
            backgroundColor: '#0B1729',
        }}>
            <Paper elevation={1} sx={{
                position: 'relative',
                width: '100%',
                maxWidth: 400,
                borderRadius: 4,
                overflow: 'hidden',
                border: 'none',
                boxShadow: CARD_SHADOW,
            }}>
                <Box sx={{
                    position: 'relative',
                    backgroundImage: 'linear-gradient(180deg, #FFFFFF 0%, #F6F8FC 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    px: 3,
                    pt: isBrand ? 5 : 4,
                    pb: isBrand ? 4 : 3.5,
                    '&::after': {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        bottom: 0,
                        height: 2,
                        backgroundImage: GRADIENT_GOLD,
                    },
                }}>
                    <Box component="img" src={isBrand ? '/logo512.png' : '/logo192.png'} alt="Sync"
                         sx={{
                             width: isBrand ? 112 : 44,
                             height: isBrand ? 112 : 44,
                             borderRadius: isBrand ? '24px' : '12px',
                             boxShadow: '0 14px 30px rgba(11, 23, 41, 0.28)',
                             mb: isBrand ? 2.5 : 1.5,
                         }}/>
                    <Typography component="h1" variant="h5" fontWeight={700}
                                sx={{color: 'text.primary', textAlign: 'center'}}>
                        {title}
                    </Typography>
                    {subtitle && (
                        <Typography variant="body2"
                                    sx={{color: 'text.secondary', mt: 0.5, textAlign: 'center'}}>
                            {subtitle}
                        </Typography>
                    )}
                </Box>
                <Box sx={{p: {xs: 3, sm: 5}, pt: {xs: 3, sm: 4}}}>
                    {error && (
                        <Typography color="error" variant="body2" textAlign="center" sx={{mb: 2}}>
                            {error}
                        </Typography>
                    )}
                    {children}
                </Box>
            </Paper>
        </Box>
    );
};

export default AuthShell;
