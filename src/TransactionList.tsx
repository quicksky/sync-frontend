import React, {ChangeEvent, useEffect, useState} from 'react';
import {
    Box,
    Button,
    Collapse,
    FormControl,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    TextField,
    Typography
} from '@mui/material';
import {getTransactionImage, setTransactionInfo, uploadTransactionFile} from "./Backend";
import {Account} from "./redux/accountSlice";
import ImageViewer from 'react-simple-image-viewer';
import {useAppDispatch, useAppSelector} from "./redux/store";
import {selectIsAdmin, selectUser} from "./redux/userSlice";
import {fetchTransactions, Transaction} from "./redux/transactionSlice";

interface TransactionListProps {
    transactions: Transaction[];
    accounts: Account[];
    isAdmin: boolean
}

const TransactionList: React.FC<TransactionListProps> = ({transactions, accounts, isAdmin}) => {
    const [openTransactionId, setOpenTransactionId] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [file, setFile] = useState<File | null>(null)
    const [memo, setMemo] = useState<string | null>(null);
    const [accountId, setAccountId] = useState<number | null>(null)
    const rowsPerPage = 50;
    const [isViewerOpen, setViewerOpen] = useState<boolean>(false)
    const [images, setImages] = useState<string[]>([])
    const dispatch = useAppDispatch()


    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setFile(event.target.files[0]);
        }
    };
    const handleRowClick = (transaction: Transaction) => {
        setMemo(transaction ? transaction.memo : null)
        setAccountId(transaction.internal_account)
        console.log(accountId)
        if (transaction && transaction.receipt_key) {
            getTransactionImage(transaction.transaction_id).then((file) => {
                setImages([file])
            }).catch(() => {
                setImages([])
            })
        } else {
            setImages([])
        }

        setOpenTransactionId(openTransactionId === transaction.transaction_id ? null : transaction.transaction_id);
    };

    const closeImageViewer = () => {
        setViewerOpen(false);
    };


    const handleSave = (transaction: Transaction) => {
        const transactionInfoPromise = setTransactionInfo({
            id: transaction.transaction_id,
            account_id: accountId,
            memo: memo
        }).then(() => {
            setMemo(null);
            setAccountId(null);
        });

        const uploadFilePromise = file ? uploadTransactionFile({
            id: transaction.transaction_id,
            file: file
        }).then(() => {
            setFile(null);
        }) : Promise.resolve();
        
        Promise.all([transactionInfoPromise, uploadFilePromise])
            .then(() => {
                dispatch(fetchTransactions(isAdmin));
                setImages([]);
                setOpenTransactionId(null);
            })
            .catch((error) => {
                //error
            });
    };

    return (

        <Paper style={{padding: '20px', marginTop: '20px', overflowX: 'auto'}}>
            {isViewerOpen ? (
                <ImageViewer
                    src={images}
                    currentIndex={0}
                    disableScroll={true}
                    closeOnClickOutside={true}
                    onClose={closeImageViewer}
                />
            ) : (
                <><Typography variant="h6" style={{marginBottom: '20px'}}>
                    Transaction History
                </Typography><TableContainer component={Paper}>
                    <Table stickyHeader aria-label="sticky table">
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
                                              onClick={() => handleRowClick(transaction)}
                                              style={{cursor: 'pointer'}}>
                                        <TableCell>{transaction.date}</TableCell>
                                        <TableCell>{transaction.name}</TableCell>
                                        <TableCell align="right">{transaction.amount}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell style={{paddingBottom: 0, paddingTop: 0}} colSpan={6}>
                                            <Collapse in={openTransactionId === transaction.transaction_id}
                                                      timeout="auto"
                                                      unmountOnExit>
                                                <Box margin={1}>
                                                    <Typography variant="h6" gutterBottom component="div">
                                                        Edit Transaction
                                                    </Typography>
                                                    <FormControl fullWidth margin="normal">
                                                        <InputLabel>Account</InputLabel>
                                                        <Select defaultValue={accountId ? +accountId : ""}
                                                                onChange={(e) => setAccountId(+e.target.value)}>
                                                            {accounts.map(account => (
                                                                <MenuItem key={account.id}
                                                                          value={account.id}>{account.name}</MenuItem>
                                                            ))}
                                                        </Select>
                                                    </FormControl>
                                                    <TextField value={memo} label="Memo" fullWidth margin="normal"
                                                               onChange={(e) => setMemo(e.target.value)}/>
                                                    <Button variant="contained" component="label">
                                                        Upload Picture
                                                        <input type="file" hidden onChange={handleFileChange}/>
                                                    </Button>
                                                    {images.length ? (<Button variant="contained" color="primary"
                                                                              onClick={() => setViewerOpen(!isViewerOpen)}>
                                                        View File
                                                    </Button>) : undefined}

                                                    {file ? (
                                                        <Typography>
                                                            {file.name}

                                                        </Typography>
                                                    ) : undefined}

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
                </TableContainer><TablePagination
                    rowsPerPageOptions={[50]}
                    component="div"
                    count={transactions.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}/></>
            )}
        </Paper>
    );
};

export default TransactionList;
