import React, {ReactElement, useState} from 'react';
import {
    Box,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    TextField,
    Typography,
    IconButton,
    CircularProgress, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import {getTransactionImage, GetTransactionRequest, setTransactionInfo} from "./Backend";
import {useAppDispatch} from "./redux/store";
import {fetchAndClearTransactions, fetchTransactions, Transaction} from "./redux/transactionSlice";
import {Check, Close, Edit, Receipt} from "@mui/icons-material";
import {formatUSD} from "./helpers/formatUSD";
import {Account} from "./redux/accountSlice";
import {Viewer} from "@react-pdf-viewer/core";
import ImageViewer from "react-simple-image-viewer";
import {defaultLayoutPlugin, ToolbarProps} from "@react-pdf-viewer/default-layout";
import {getAWSPresignedFileExtension} from "./helpers/getAWSPresignedFileExtension";

interface AdminTableProps {
    transactions: Transaction[];
    accounts: Account[];
    count: number;
}

const AdminTable: React.FC<AdminTableProps> = ({transactions, accounts, count}) => {
    const dispatch = useAppDispatch();
    const [page, setPage] = useState(0);
    const rowsPerPage = 50;
    const [activeTransactionId, setActiveTransactionId] = useState<string>("");
    const [accountId, setAccountId] = useState<number | null>(null)
    const [isPdfViewerOpen, setPdfViewerOpen] = useState<boolean>(false);
    const [receiptUrl, setReceiptUrl] = useState<string>("");
    const [isImageViewerOpen, setImageViewerOpen] = useState<boolean>(false);
    const [editTransactionDetails, setEditTransactionDetails] = useState<{
        memo: string | null;
        account: number | null
    }>({memo: null, account: null});

    const handleEditChange = (field: string, value: string) => {
        setEditTransactionDetails(prevDetails => ({
            ...prevDetails,
            [field]: value,
        }));
    };

    const handleLoadReceipt = (transaction: Transaction) => {
        if (transaction && transaction.receipt_key) {
            getTransactionImage(transaction.transaction_id).then((file) => {
                setReceiptUrl(file)
                getAWSPresignedFileExtension(file) === 'pdf' ? setPdfViewerOpen(true) : setImageViewerOpen(true);
            }).catch(() => {
                setReceiptUrl("")
            })
        } else {
            setReceiptUrl("")
        }
    }

    //todo
    const [transactionRequest, setTransactionRequest] = useState<GetTransactionRequest>({limit: 50, offset: 0})
    const renderToolbar = (Toolbar: (props: ToolbarProps) => ReactElement) => (
        <>
            <Toolbar/>
            <IconButton onClick={() => setPdfViewerOpen(false)}>
                <Close></Close>
            </IconButton>
        </>
    );

    const defaultLayoutPluginInstance = defaultLayoutPlugin({
        renderToolbar,
    });

    const handleSubmitEdit = (transactionId: string) => {

        setTransactionInfo({
            id: transactionId,
            account_id: accountId,
            memo: editTransactionDetails.memo
        }).then(() => {
            dispatch(fetchAndClearTransactions(transactionRequest));
        });
        setActiveTransactionId(""); // Close editing mode
    };

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
        // You might want to implement further logic here for fetching new transactions
    };
    const closeImageViewer = () => {
        setImageViewerOpen(false);
    };

    return (
        isPdfViewerOpen ? (

            <div style={{
                backgroundColor: '#fefefe',
                margin: 'auto',
                padding: 20,
                border: '1px solid #888',
                width: '80%',
                maxHeight: '90vh',
                overflowY: 'auto',
                height: '750px'
            }}>
                <Viewer

                    plugins={[defaultLayoutPluginInstance]}
                    fileUrl={receiptUrl}
                />
                <Button onClick={() => setPdfViewerOpen(false)}>Close</Button>
            </div>

        ) : (
            isImageViewerOpen ? <Box sx={{mt: 50}}><ImageViewer
                src={[receiptUrl]}
                currentIndex={0}
                disableScroll={true}
                closeOnClickOutside={true}
                onClose={closeImageViewer}/></Box> : (
                <Paper style={{padding: '20px', marginTop: '20px', overflowX: 'auto'}}>
                    <Typography variant="h6" style={{marginBottom: '20px'}}>
                        Transaction History
                    </Typography>
                    <TableContainer component={Paper}>
                        <Table stickyHeader aria-label="sticky table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Description</TableCell>
                                    <TableCell>Memo</TableCell>
                                    <TableCell>Account</TableCell>
                                    <TableCell>Owner</TableCell>
                                    <TableCell>Amount</TableCell>
                                    <TableCell>Receipt</TableCell>
                                    <TableCell>Edit</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {transactions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((transaction) => {
                                    const account = accounts.find((a) => a.id === transaction.internal_account)
                                    const accountName = account ? account.name : ""
                                    const isEditable = activeTransactionId === transaction.transaction_id;
                                    return (
                                        <TableRow key={transaction.transaction_id}>
                                            <TableCell>{transaction.memo && transaction.receipt_key && transaction.internal_account ?
                                                <Check/> : <Close/>}</TableCell>
                                            <TableCell>{transaction.date}</TableCell>
                                            <TableCell>
                                                {transaction.name}
                                            </TableCell>
                                            <TableCell>
                                                {isEditable ? (
                                                    <TextField
                                                        size="small"
                                                        value={editTransactionDetails.memo || transaction.memo}
                                                        onChange={(e) => handleEditChange('memo', e.target.value)}
                                                    />
                                                ) : transaction.memo}
                                            </TableCell>
                                            <TableCell>
                                                {isEditable ? (
                                                    <FormControl focused color="secondary" variant="outlined"
                                                                 fullWidth
                                                                 margin="normal">
                                                        <InputLabel color="secondary"
                                                                    sx={{input: {color: 'secondary.main'}}}>Account</InputLabel>
                                                        <Select labelId="label-for-account" label="Account"
                                                                defaultValue={editTransactionDetails.account ? +editTransactionDetails.account : ""}
                                                                onChange={(e) => setAccountId(+e.target.value)}>
                                                            {accounts.map(account => (
                                                                <MenuItem key={account.id}
                                                                          value={account.id}>{account.name}</MenuItem>
                                                            ))}
                                                        </Select>
                                                    </FormControl>
                                                ) : accountName}
                                            </TableCell>
                                            <TableCell>{transaction.account_owner}</TableCell>
                                            <TableCell align="right">{formatUSD(transaction.amount)}</TableCell>
                                            <TableCell>
                                                {transaction.receipt_key && <IconButton
                                                    onClick={() => handleLoadReceipt(transaction)}><Receipt/></IconButton>}
                                            </TableCell>
                                            <TableCell>
                                                {isEditable ? (
                                                    <>
                                                        <IconButton
                                                            onClick={() => handleSubmitEdit(transaction.transaction_id)}><Check/></IconButton>
                                                        <IconButton
                                                            onClick={() => setActiveTransactionId("")}><Close/></IconButton>
                                                    </>
                                                ) : (
                                                    <IconButton onClick={() => {
                                                        setActiveTransactionId(transaction.transaction_id);
                                                        setEditTransactionDetails({
                                                            memo: transaction.memo,
                                                            account: transaction.internal_account
                                                        });
                                                    }}><Edit/></IconButton>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[50]}
                        component="div"
                        count={count}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                    />
                </Paper>)
        ))
};

export default AdminTable;
