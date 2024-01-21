import React, {useState} from 'react';
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
    Box,
    Collapse,
    TextField,
    Button,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    TablePagination
} from '@mui/material';
import {Transaction} from "./Backend";

interface TransactionListProps {
    transactions: Transaction[];
}

const TransactionList: React.FC<TransactionListProps> = ({transactions}) => {
    const [openTransactionId, setOpenTransactionId] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const rowsPerPage = 50;

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleRowClick = (transactionId: string) => {
        setOpenTransactionId(openTransactionId === transactionId ? null : transactionId);
    };

    const handleSave = (transaction: Transaction) => {
        // Implement save logic
        setOpenTransactionId(null);
    };

    return (
        <Paper style={{padding: '20px', marginTop: '20px', maxWidth: "75%"}}>
            <Typography variant="h6" style={{marginBottom: '20px'}}>
                Transaction History
            </Typography>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell align="right">Amount</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {transactions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((transaction) => (
                        <>
                            <TableRow key={transaction.transaction_id}
                                      onClick={() => handleRowClick(transaction.transaction_id)}
                                      style={{cursor: 'pointer'}}>
                                <TableCell>{transaction.date}</TableCell>
                                <TableCell>{transaction.name}</TableCell>
                                <TableCell align="right">{transaction.amount}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell style={{paddingBottom: 0, paddingTop: 0}} colSpan={6}>
                                    <Collapse in={openTransactionId === transaction.transaction_id} timeout="auto"
                                              unmountOnExit>
                                        <Box margin={1}>
                                            <Typography variant="h6" gutterBottom component="div">
                                                Edit Transaction
                                            </Typography>
                                            <FormControl fullWidth margin="normal">
                                                <InputLabel>Account</InputLabel>
                                                <Select defaultValue="">

                                                    <MenuItem>Test</MenuItem>

                                                </Select>
                                            </FormControl>
                                            <TextField label="Memo" fullWidth margin="normal"/>
                                            <Button variant="contained" component="label">
                                                Upload Picture
                                                <input type="file" hidden/>
                                            </Button>
                                            <Box mt={2}>
                                                <Button variant="contained" color="primary"
                                                        onClick={() => handleSave(transaction)}>
                                                    Save
                                                </Button>
                                            </Box>
                                        </Box>
                                    </Collapse>
                                </TableCell>
                            </TableRow>
                        </>
                    ))}
                </TableBody>
            </Table>
            <TablePagination
                rowsPerPageOptions={[50]}
                component="div"
                count={transactions.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
            />
        </Paper>
    );
};

export default TransactionList;
