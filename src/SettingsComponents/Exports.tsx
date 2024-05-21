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
//
//
// import React, {useState} from 'react';
// import {Checkbox, TextField, Typography, Paper, Box, Stack, FormControlLabel} from '@mui/material';
// import {ExcelMapping, updateClientExcelMapping} from "../redux/clientSlice";
// import {useAppDispatch} from "../redux/store";
//
// interface FieldProps {
//     name: string;
//     includeInExports: boolean;
//     columnIndex: number;
//     onIncludeChange: (include: boolean) => void;
//     onColumnChange: (column: number) => void;
// }
//
// const Field: React.FC<FieldProps> = ({name, includeInExports, columnIndex, onIncludeChange, onColumnChange}) => (
//     <Paper elevation={2} sx={{padding: 2, marginBottom: 2}}>
//         <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
//             <Typography variant="subtitle1" sx={{flex: 1}}>{name}</Typography>
//             <FormControlLabel
//                 control={
//                     <Checkbox
//                         checked={includeInExports}
//                         onChange={(e) => onIncludeChange(e.target.checked)}
//                         color="secondary"
//                     />
//                 }
//                 label="Include in Exports"
//                 sx={{flex: 1}}
//             />
//             <TextField
//                 label="Column Index"
//                 type="number"
//                 size="small"
//                 value={columnIndex}
//                 onChange={(e) => onColumnChange(Number(e.target.value))}
//                 inputProps={{min: 1}}
//                 disabled={!includeInExports}
//                 variant="outlined"
//                 sx={{width: '120px', flex: 1}}
//             />
//         </Stack>
//     </Paper>
// );
//
// interface ExportProps {
//     mapping?: ExcelMapping
// }
//
// const Exports: React.FC<ExportProps> = ({mapping}) => {
//     const dispatch = useAppDispatch()
//
//
//     const handleIncludeChange = (field: string, include: boolean) => {
//         mapping && dispatch(updateClientExcelMapping({id: mapping.id, [field]: "null"}))
//     };
//
//     const handleColumnChange = (field: string, column: number) => {
//         mapping && dispatch(updateClientExcelMapping({id: mapping.id, [field]: column}))
//     };
//
//     return (
//         <Box sx={{margin: 3}}>
//             {mapping && Object.entries(mapping).map(([key, value]) => (
//                 key !== 'id' ?
//                     <Field
//                         key={key}
//                         name={key.charAt(0).toUpperCase() + key.slice(1)}
//                         includeInExports={value}
//                         columnIndex={value}
//                         onIncludeChange={(include) => handleIncludeChange(key, include)}
//                         onColumnChange={(column) => handleColumnChange(key, column)}
//                     /> : undefined
//             ))}
//         </Box>
//     );
// };
//
// export default Exports;
//
