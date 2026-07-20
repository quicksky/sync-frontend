import React from 'react';
import {Box} from '@mui/material';
import {keyframes} from '@mui/system';

const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

interface SyncLoadingSpinnerProps {
    size?: number;
}

const SyncLoadingSpinner: React.FC<SyncLoadingSpinnerProps> = ({size = 64}) => {
    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                minHeight: 'calc(100vh - 64px)',
            }}
        >
            <Box
                sx={{
                    width: size,
                    height: size,
                    borderRadius: '50%',
                    border: (theme) => `${Math.max(4, size / 12)}px solid ${theme.palette.secondary.light}`,
                    borderTopColor: (theme) => theme.palette.primary.main,
                    animation: `${spin} 0.9s linear infinite`,
                }}
            />
        </Box>
    );
};

export default SyncLoadingSpinner;
