import React, {useState} from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    IconButton,
    Paper, Checkbox, FormControlLabel
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import {useAppDispatch, useAppSelector} from "../redux/store";
import {fetchVendorList, selectVendors} from "../redux/clientSlice";
import {addVendor, addVendorAlias, deleteVendor, deleteVendorAlias} from "../Backend";
import {Add, PlusOne} from "@mui/icons-material";
import Box from "@mui/material/Box"; // Adapt these imports to your project structure


const Exports: React.FC = () => {
    const imageStyle = {
        width: '200px',
        height: '200px',
        borderRadius: '50%',
    };

    return (
        <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
            <Paper elevation={3}
                   style={{padding: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                <img src={"https://assets.quicksky.net/mom.jpg"} style={imageStyle}/>
            </Paper>
        </Box>
    );
};

export default Exports;

