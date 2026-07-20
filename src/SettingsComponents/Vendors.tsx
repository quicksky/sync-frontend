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
    Paper, Checkbox, FormControlLabel, Tooltip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import {useAppDispatch, useAppSelector} from "../redux/store";
import {fetchVendorList, selectVendors} from "../redux/clientSlice";
import {addVendor, addVendorAlias, deleteVendor, deleteVendorAlias} from "../Backend";
import {Add, PlusOne} from "@mui/icons-material";
import Box from "@mui/material/Box"; // Adapt these imports to your project structure


interface AddAliasDialogProps {
    open: boolean;
    onClose: () => void;
    vendorId: number;
    setErrorDialog: React.Dispatch<React.SetStateAction<boolean>>;
}

const AddAliasDialog: React.FC<AddAliasDialogProps> = ({open, onClose, vendorId, setErrorDialog}) => {
    const [alias, setAlias] = useState('');
    const [startsWith, setStartsWith] = useState(false);
    const dispatch = useAppDispatch();

    const handleAdd = () => {
        addVendorAlias({vendor_id: vendorId, vendor_alias: alias, starts_with: startsWith}).then(() => {
            dispatch(fetchVendorList())
        }).catch(() => setErrorDialog(true)).finally(() => {
            setAlias('')
            setStartsWith(false)
            onClose()
        });
    };


    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Add Alias</DialogTitle>
            <DialogContent>
                <FormControlLabel
                    control={<Checkbox sx={{
                        "&, & + .MuiFormControlLabel-label": {
                            color: "secondary.main"
                        }
                    }} color="secondary" checked={startsWith}
                                       onChange={(evt) => setStartsWith(evt.target.checked)}/>}
                    label="Starts with"
                    name="starts_with"
                    id="starts_with"
                />
                <TextField
                    autoFocus
                    margin="dense"
                    id="alias"
                    label="Alias"
                    type="text"
                    fullWidth
                    variant="standard"
                    color="secondary"
                    value={alias}
                    onChange={(e) => setAlias(e.target.value)}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={() => {
                    setStartsWith(false)
                    setAlias('')
                    onClose()
                }}>Cancel</Button>
                <Button variant={'contained'} color={'secondary'} onClick={handleAdd}>Add</Button>
            </DialogActions>
        </Dialog>
    );
};

interface AddVendorDialogProps {
    open: boolean;
    onClose: () => void;
    setErrorDialog: React.Dispatch<React.SetStateAction<boolean>>;
}

const AddVendorDialog: React.FC<AddVendorDialogProps> = ({open, onClose, setErrorDialog}) => {
    const [vendorName, setVendorName] = useState('');
    const dispatch = useAppDispatch()
    // This function should add a new vendor by interacting with your backend
    const handleAdd = () => {
        addVendor(vendorName).then(() => {
            dispatch(fetchVendorList())
        }).catch(() => setErrorDialog(true)).finally(() => {
            setVendorName('')
            onClose()
        })
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Add New Vendor</DialogTitle>
            <DialogContent>
                <TextField
                    color="secondary"
                    required
                    margin="dense"
                    label="Vendor Name"
                    name="vendor_name"
                    id="vendor_name"
                    fullWidth
                    variant="standard"
                    onChange={(e) => setVendorName(e.target.value)}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={() => {
                    setVendorName('')
                    onClose()
                }}>Cancel</Button>
                <Button variant='contained' color={'secondary'} onClick={handleAdd}>Add</Button>
            </DialogActions>
        </Dialog>
    );
};

const ConfirmationDialog: React.FC<{
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
}> = ({open, onClose, onConfirm, title, message}) => (
    <Dialog open={open} onClose={onClose}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
            <DialogContentText>{message}</DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button onClick={onClose}>Cancel</Button>
            <Button onClick={onConfirm} color="error" variant='contained'>
                Delete
            </Button>
        </DialogActions>
    </Dialog>
);
const ErrorDialog: React.FC<{
    open: boolean;
    onConfirm: () => void;
    title: string;
    message: string;
}> = ({open, onConfirm, title, message}) => (
    <Dialog open={open}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
            <DialogContentText>{message}</DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button onClick={onConfirm} color="secondary" variant='contained'>
                Ok
            </Button>
        </DialogActions>
    </Dialog>
);

const Vendors: React.FC = () => {
    const vendors = useAppSelector(selectVendors);
    const [addAliasDialogOpen, setAddAliasDialogOpen] = useState(false);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [confirmDialogAction, setConfirmDialogAction] = useState<() => void>(() => () => {
    });
    const [errorDialogOpen, setErrorDialogOpen] = useState<boolean>(false)
    const dispatch = useAppDispatch()
    const [addVendorDialogOpen, setAddVendorDialogOpen] = useState(false);


    const [currentVendorId, setCurrentVendorId] = useState<number | null>(null);

    const handleOpenAddAliasDialog = (vendorId: number) => {
        setCurrentVendorId(vendorId);
        setAddAliasDialogOpen(true);
    };

    const openConfirmDialog = (action: () => void, title: string, message: string) => {
        setConfirmDialogAction(() => action);
        setConfirmDialogOpen(true);
    };

    const handleDeleteVendor = (vendorId: number) => {
        deleteVendor(vendorId).then(() => dispatch(fetchVendorList()))
    };

    const handleDeleteAlias = (vendorId: number, alias: string) => {
        deleteVendorAlias({vendor_id: vendorId, vendor_alias: alias}).then(() => dispatch(fetchVendorList()))
    };

    return (
        <>
            <Box sx={{width: "90%", maxWidth: 1100, mx: 'auto'}}>
                <Box display="flex" justifyContent="space-between" alignItems="center" sx={{mb: 2}}>
                    <Typography variant="h6" fontWeight={700}>Vendors</Typography>
                    <Button variant="contained" color="primary" onClick={() => setAddVendorDialogOpen(true)}>
                        Add New Vendor
                    </Button>
                </Box>

                <TableContainer component={Paper} elevation={1}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Vendor Name</TableCell>
                                <TableCell>Aliases</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {vendors.map((vendor) => (
                                <TableRow key={vendor.id} hover>
                                    <TableCell>{vendor.vendor_name}</TableCell>
                                    <TableCell>
                                        {vendor.aliases.map((alias, index) => (
                                            <div key={index} style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                                                <Typography variant="body2">{alias.starts_with ? "(starts with)* " + alias.vendor_alias : alias.vendor_alias}</Typography>
                                                <IconButton size="small"
                                                    onClick={() => openConfirmDialog(() => handleDeleteAlias(vendor.id, alias.vendor_alias), "Confirm Delete", `Are you sure you want to delete alias "${alias.vendor_alias}"?`)}>
                                                    <DeleteIcon fontSize="small"/>
                                                </IconButton>
                                            </div>
                                        ))}
                                    </TableCell>
                                    <TableCell align="right">
                                        <Tooltip title="Add alias">
                                            <IconButton
                                                onClick={() => handleOpenAddAliasDialog(vendor.id)}><Add fontSize="small"/></IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete vendor">
                                            <IconButton color="error"
                                                onClick={() => openConfirmDialog(() => handleDeleteVendor(vendor.id), "Confirm Delete", `Are you sure you want to delete vendor "${vendor.vendor_name}"?`)}>
                                                <DeleteIcon fontSize="small"/>
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
            {currentVendorId !== null && (
                <AddAliasDialog
                    open={addAliasDialogOpen}
                    onClose={() => {
                        setAddAliasDialogOpen(false)

                    }}
                    vendorId={currentVendorId}
                    setErrorDialog={setErrorDialogOpen}
                />
            )}
            <ConfirmationDialog
                open={confirmDialogOpen}
                onClose={() => setConfirmDialogOpen(false)}
                onConfirm={() => {
                    confirmDialogAction();
                    setConfirmDialogOpen(false);
                }}
                title="Confirm Delete"
                message="Are you sure you want to proceed with deletion?"
            />
            <AddVendorDialog
                open={addVendorDialogOpen}
                onClose={() => setAddVendorDialogOpen(false)}
                setErrorDialog={setErrorDialogOpen}
            />
            <ErrorDialog open={errorDialogOpen} onConfirm={() => setErrorDialogOpen(false)} title={"Error"}
                         message={"There was an error with your request."}/>
        </>
    );
};

export default Vendors;

