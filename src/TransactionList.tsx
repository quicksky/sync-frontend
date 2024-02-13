import React, {ChangeEvent, useRef, useState} from 'react';
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
    Typography, IconButton, Tooltip, CircularProgress
} from '@mui/material';
import {
    deleteReceipt,
    getTransactionImage,
    GetTransactionRequest,
    setTransactionInfo,
    uploadTransactionFile
} from "./Backend";
import {Account} from "./redux/accountSlice";
import ImageViewer from 'react-simple-image-viewer';
import {useAppDispatch} from "./redux/store";
import {fetchAndClearTransactions, fetchTransactions, Transaction} from "./redux/transactionSlice";
import {Check, Close, Delete, Receipt, Upload} from "@mui/icons-material";
import {formatUSD} from "./helpers/formatUSD";
import Compress from 'compress.js'


const compressionValue = 0.5

interface TransactionListProps {
    transactions: Transaction[];
    accounts: Account[];
    count: number

}


const TransactionList: React.FC<TransactionListProps> = ({transactions, accounts, count}) => {
    const [openTransactionId, setOpenTransactionId] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [file, setFile] = useState<{ file: File, name: string } | null>(null)
    const [memo, setMemo] = useState<string | null>(null);
    const [accountId, setAccountId] = useState<number | null>(null)
    const rowsPerPage = 50;
    const [isViewerOpen, setViewerOpen] = useState<boolean>(false)
    const [images, setImages] = useState<string[]>([])
    const uploadReceiptInput = useRef<HTMLInputElement>(null);
    const handleRecieptInputClick = () => {
        uploadReceiptInput.current?.click()
    };
    const dispatch = useAppDispatch()
    const [paginationLoading, setPaginationLoading] = useState<boolean>(false);

    const compress = new Compress()

    const [transactionRequest, setTransactionRequest] = useState<GetTransactionRequest>({limit: 50, offset: 0})


    const handleChangePage = (event: unknown, newPage: number) => {
        setPaginationLoading(true)
        setTransactionRequest({offset: 0, limit: (newPage + 1) * 50})
        if (((newPage + 1) * 50) > transactions.length) {
            dispatch(fetchTransactions({
                offset: newPage * 50,
                limit: 50,
                filters: {include_payments: false}
            })).then(() => (
                setPage(newPage)
            ))
        } else {
            setPage(newPage)
        }
        setPaginationLoading(false)
    };

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const originalFile = event.target.files ? event.target.files[0] : null
        originalFile && compress.compress([originalFile], {
            size: 1,
            quality: compressionValue,
            resize: false
        }).then((data) => {
            const img = data[0];
            const base64str = img.data;
            const imgExt = img.ext;
            const file = Compress.convertBase64ToFile(base64str, imgExt);
            setFile({file, name: originalFile.name})
        })
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
            file: file.file
        }).then(() => {
            setFile(null);
            console.log(1)
        }) : Promise.resolve()


        Promise.all([transactionInfoPromise, uploadFilePromise])
            .then(() => {
                console.log(2)
                dispatch(fetchAndClearTransactions(transactionRequest));
                setImages([]);
                setOpenTransactionId(null);
            })
            .catch((error) => {
                //error
            });
    };

    const handleDelete = (transactionId: string) => {
        deleteReceipt(transactionId).then(() => {
            dispatch(fetchAndClearTransactions(transactionRequest))
            setImages([]);
            setOpenTransactionId(null);
        })
    }

    return (
        isViewerOpen ? <Box sx={{mt: 50}}><ImageViewer
                src={images}
                currentIndex={0}
                disableScroll={true}
                closeOnClickOutside={true}
                onClose={closeImageViewer}/></Box> :
            <Paper style={{padding: '20px', marginTop: '20px', overflowX: 'auto'}}>
                <Typography variant="h6" style={{marginBottom: '20px'}}>
                    Transaction History
                </Typography><TableContainer component={Paper}>
                <Table stickyHeader aria-label="sticky table">
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{color: "primary.main"}}>Date</TableCell>
                            <TableCell sx={{color: "primary.main"}}>Reviewed</TableCell>
                            <TableCell sx={{color: "primary.main"}}>Description</TableCell>
                            <TableCell sx={{color: "primary.main"}} align="right">Amount</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {transactions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((transaction) => (
                            <>
                                <TableRow key={transaction.transaction_id}
                                          onClick={() => handleRowClick(transaction)}
                                          style={{cursor: 'pointer'}}>
                                    <TableCell>{transaction.date}</TableCell>
                                    <TableCell>{transaction.memo && transaction.receipt_key && transaction.internal_account ?
                                        <Check/> : <Close/>}</TableCell>
                                    <TableCell>{transaction.name}</TableCell>
                                    <TableCell align="right">{formatUSD(transaction.amount)}</TableCell>
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
                                                <FormControl focused color="secondary" variant="outlined"
                                                             fullWidth
                                                             margin="normal">
                                                    <InputLabel color="secondary"
                                                                sx={{input: {color: 'secondary.main'}}}>Account</InputLabel>
                                                    <Select labelId="label-for-account" label="Account"
                                                            defaultValue={accountId ? +accountId : ""}
                                                            onChange={(e) => setAccountId(+e.target.value)}>
                                                        {accounts.map(account => (
                                                            <MenuItem key={account.id}
                                                                      value={account.id}>{account.name}</MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                                <TextField
                                                    focused
                                                    color="secondary"
                                                    sx={{input: {color: 'secondary.main'}}}
                                                    value={memo}
                                                    label="Memo"
                                                    fullWidth margin="normal"
                                                    onChange={(e) => setMemo(e.target.value)}/>
                                                <Button variant="contained" component="label">
                                                    Upload Receipt
                                                    <input type="file" hidden onChange={handleFileChange}/>
                                                </Button>
                                                {images.length ? (
                                                    <><Button sx={{ml: 2}} variant="contained" color="primary"
                                                              onClick={() => setViewerOpen(!isViewerOpen)}>
                                                        View Receipt
                                                    </Button>

                                                        <Tooltip title={"Delete Receipt"}>
                                                            <IconButton sx={{ml: 2}}
                                                                        onClick={() => handleDelete(transaction.transaction_id)}>
                                                                <Delete></Delete>
                                                            </IconButton></Tooltip></>) : undefined}

                                                {file ? (
                                                    <Typography>
                                                        Selected File: {file.name}
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
            </TableContainer>
                {paginationLoading ?
                    (<CircularProgress/>) :
                    (<TablePagination
                        rowsPerPageOptions={[50]}
                        component="div"
                        count={count}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}/>)}


            </Paper>
    );
};

export default TransactionList;
