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
    const thickness = Math.max(4, size / 12);
    const mask = `radial-gradient(farthest-side, transparent calc(100% - ${thickness}px), #000 calc(100% - ${thickness}px))`;
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
                    backgroundImage: 'conic-gradient(from 90deg, #D9BF95 0%, #A67C42 35%, #20202E 70%, #D9BF95 100%)',
                    animation: `${spin} 0.85s linear infinite`,
                    WebkitMask: mask,
                    mask,
                }}
            />
        </Box>
    );
};

export default SyncLoadingSpinner;
