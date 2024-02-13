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


interface AdminTableProps {
    transactions: Transaction[];
    accounts: Account[];
    count: number;

}


const AdminTable: React.FC<AdminTableProps> = ({transactions, accounts, count}) => {
    const [page, setPage] = useState(0);
    const rowsPerPage = 50;
    const [isViewerOpen, setViewerOpen] = useState<boolean>(false)
    const [images, setImages] = useState<string[]>([])
    const dispatch = useAppDispatch()
    const [paginationLoading, setPaginationLoading] = useState<boolean>(false);

    const compress = new Compress()

    const [transactionRequest, setTransactionRequest] = useState<GetTransactionRequest>({limit: 50, offset: 0})

    const handleLoadReceipt = (transaction: Transaction) => {
        if (transaction && transaction.receipt_key) {
            getTransactionImage(transaction.transaction_id).then((file) => {
                setImages([file])
                setViewerOpen(true)
            }).catch(() => {
                setImages([])
            })
        } else {
            setImages([])
        }
    }

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


    const closeImageViewer = () => {
        setViewerOpen(false);
    };

    // @ts-ignore
    // @ts-ignore
    return (
        isViewerOpen ? <Box sx={{mt: 50}}><ImageViewer
                src={images}
                currentIndex={0}
                disableScroll={true}
                closeOnClickOutside={true}
                onClose={closeImageViewer}/></Box> :
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
                                    <TableCell sx={{color: "primary.main"}}>Reviewed</TableCell>
                                    <TableCell sx={{color: "primary.main"}}>Date</TableCell>
                                    <TableCell sx={{color: "primary.main"}}>Description</TableCell>
                                    <TableCell sx={{color: "primary.main"}}>Memo</TableCell>
                                    <TableCell sx={{color: "primary.main"}}>Account</TableCell>
                                    <TableCell sx={{color: "primary.main"}}>Amount</TableCell>
                                    <TableCell sx={{color: "primary.main"}} align="right">Receipt</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {transactions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((transaction) => {
                                    const account = accounts.find((a) => a.id === transaction.internal_account)
                                    const accountName = account ? account.name : ""
                                    return (
                                        <>
                                            <TableRow key={transaction.transaction_id}>
                                                <TableCell>{transaction.memo && transaction.receipt_key && transaction.internal_account ?
                                                    <Check/> : <Close/>}</TableCell>
                                                <TableCell>{transaction.date}</TableCell>
                                                <TableCell>{transaction.name}</TableCell>
                                                <TableCell>{transaction.memo}</TableCell>
                                                <TableCell>{accountName}</TableCell>
                                                <TableCell align="right">{formatUSD(transaction.amount)}</TableCell>
                                                <TableCell>{transaction.receipt_key ? <IconButton
                                                    onClick={() => handleLoadReceipt(transaction)}><Receipt/></IconButton> : undefined}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                            </TableRow>
                                        </>
                                    )
                                })}
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
                    </>
                )}
            </Paper>
    );
};

export default AdminTable;
