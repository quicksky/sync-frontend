import React, {ChangeEvent, ReactElement, useEffect, useRef, useState} from 'react';
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
    Typography,
    IconButton,
    Tooltip,
    CircularProgress,
    Grid,
    DialogTitle,
    DialogContent,
    FormControlLabel,
    Checkbox,
    DialogActions, Dialog, NativeSelect
} from '@mui/material';
import {
    deleteReceipt,
    getTransactionImage,
    GetTransactionRequest,
    setTransactionInfo, TransactionFilters,
    uploadTransactionFile
} from "./Backend";
import {Account, fetchOwnAccounts} from "./redux/accountSlice";
import ImageViewer from 'react-simple-image-viewer';
import {useAppDispatch, useAppSelector} from "./redux/store";
import {
    fetchAndClearTransactions,
    fetchTransactions,
    selectCount,
    selectTransactions,
    Transaction
} from "./redux/transactionSlice";
import {CheckCircle, Close, Delete, RadioButtonUnchecked, Receipt, Upload} from "@mui/icons-material";
import {formatUSD} from "./helpers/formatUSD";
import Compress from 'compress.js'
import {Viewer} from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import {defaultLayoutPlugin, ToolbarProps} from '@react-pdf-viewer/default-layout';
import {pageNavigationPlugin} from '@react-pdf-viewer/page-navigation'

// Import the styles
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import {getAWSPresignedFileExtension} from "./helpers/getAWSPresignedFileExtension"
import {useMediaQuery} from "react-responsive"
import {selectUser} from "./redux/userSlice";
import SyncPDFViewer from "./components/SyncPDFViewer";
import {useNavigate} from "react-router-dom";
import {compressionValue, pdfFileType, supportedFileTypes} from "./helpers/fileInfo";


interface TransactionListProps {
    transactions: Transaction[];
    accounts: Account[];
    count: number

}


const TransactionList: React.FC<TransactionListProps> = ({transactions, accounts, count}) => {
    const user = useAppSelector(selectUser)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [openTransactionId, setOpenTransactionId] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [file, setFile] = useState<{ file: File, name: string } | null>(null)
    const [fileError, setFileError] = useState<string | undefined>(undefined)
    const [memo, setMemo] = useState<string | null>(null);
    const [accountId, setAccountId] = useState<number | null>(null)
    const rowsPerPage = 50;
    const [isViewerOpen, setViewerOpen] = useState<boolean>(false)
    const [isPdfViewerOpen, setPdfViewerOpen] = useState<boolean>(false);
    const [receiptUrl, setReceiptUrl] = useState<string>("");
    const [receiptIsPDF, setReceiptIsPDF] = useState<boolean>(false);
    const uploadReceiptInput = useRef<HTMLInputElement>(null);
    const isMobile = useMediaQuery({maxWidth: 600})
    const [confirmDialogOpen, setConfirmDialogOpen] = useState<boolean>(false)
    const [dataSaveLock, setDataSaveLock] = useState<boolean>(false)
    const fontSize: number = isMobile ? 13 : 14
    const handleRecieptInputClick = () => {
        uploadReceiptInput.current?.click()
    };
    const dispatch = useAppDispatch()
    const [paginationLoading, setPaginationLoading] = useState<boolean>(false);

    const compress = new Compress()


    const [transactionFilters, setTransactionFilters] = useState<TransactionFilters>({user_card_number: user?.card_number})
    const [transactionRequest, setTransactionRequest] = useState<GetTransactionRequest>({
        limit: 50,
        offset: 0,
        filters: transactionFilters
    })

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
    const pageStuff = pageNavigationPlugin();


    const handleChangePage = (event: unknown, newPage: number) => {
        setPaginationLoading(true)
        setTransactionRequest({offset: 0, limit: (newPage + 1) * 50, filters: {user_card_number: user?.card_number}})
        if (((newPage + 1) * 50) > transactions.length) {
            dispatch(fetchTransactions({
                offset: newPage * 50,
                limit: 50,
                filters: {user_card_number: user?.card_number}
            })).then(() => {
                setPage(newPage)
            })
        } else {
            setPage(newPage)
        }
        setPaginationLoading(false)
    };


    //this HAS to be refactored into an outside function for use on the admin table but im going to the beach rn :)
    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const originalFile = event.target.files ? event.target.files[0] : null
        if (!originalFile) return
        if (!supportedFileTypes.includes(originalFile.type)) {
            setFileError("Unsupported file type. We only support PDF, JPEG, and PNG files.")
            setFile(null)
            return
        }
        setFileError(undefined)
        originalFile.type != pdfFileType ? compress.compress([originalFile], {
            size: 0.5,
            quality: compressionValue,
            resize: true
        }).then((data) => {
            const img = data[0];
            const base64str = img.data;
            const imgExt = img.ext;
            const file = Compress.convertBase64ToFile(base64str, imgExt);
            setFile({file, name: originalFile.name})
        }) : setFile({file: originalFile, name: originalFile.name})
    };
    const handleRowClick = (transaction: Transaction) => {
        if (dataSaveLock) {
            // Optionally show an alert or disable interaction
            console.log('Data is currently being saved, please wait...');
            return;
        }
        setMemo(transaction ? transaction.memo : null)
        setAccountId(transaction.internal_account)
        if (transaction && transaction.receipt_key) {
            getTransactionImage(transaction.transaction_id).then((file) => {
                setReceiptIsPDF(getAWSPresignedFileExtension(file) === 'pdf');
                setReceiptUrl(file)
            }).catch(() => {
                setReceiptUrl("")
            })
        } else {
            setReceiptUrl("")
        }
        setOpenTransactionId(openTransactionId === transaction.transaction_id ? null : transaction.transaction_id);
    };

    const closeImageViewer = () => {
        setViewerOpen(false);
    };


    const handleSave = (transaction: Transaction) => {
        setDataSaveLock(true)
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
        }) : Promise.resolve()

        Promise.all([transactionInfoPromise, uploadFilePromise])
            .then(() => {
                dispatch(fetchAndClearTransactions(transactionRequest));
                setOpenTransactionId(null);
            })
            .catch((error) => {
                //error
            }).finally(() => setDataSaveLock(false));
    };

    const downloadPDFReceipt = () => {

        const link = document.createElement('a');
        link.href = receiptUrl;
        link.setAttribute(
            'download',
            `FileName.pdf`,
        );

        // Append to html link element page
        document.body.appendChild(link);

        // Start download
        link.click();

        // Clean up and remove the link
        // @ts-ignore
        link.parentNode.removeChild(link);
    }

    const openReceipt = () => {
        receiptIsPDF ? setPdfViewerOpen(true) : setViewerOpen(true)
    }

    const handleDelete = (transactionId: string) => {
        deleteReceipt(transactionId).then(() => {
            dispatch(fetchAndClearTransactions(transactionRequest))
            setOpenTransactionId(null);
            setConfirmDialogOpen(false)
        })
    }

    return (
        isPdfViewerOpen ? (
            <SyncPDFViewer fileUrl={receiptUrl} onClose={() => setPdfViewerOpen(false)}/>
        ) : (
            isViewerOpen ? <Box sx={{mt: 50}}><ImageViewer
                    src={[receiptUrl]}
                    currentIndex={0}
                    disableScroll={false}
                    closeOnClickOutside={true}
                    onClose={closeImageViewer}/></Box> :
                <><Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
                    <DialogTitle>Delete Receipt</DialogTitle>
                    <DialogContent>
                        <Typography>Are you sure you want to delete this receipt?</Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => {
                            setConfirmDialogOpen(false)
                        }}>Cancel</Button>
                        <Button variant={'contained'} color={'error'}
                                onClick={() => handleDelete(openTransactionId ? openTransactionId : "")}>Delete</Button>
                    </DialogActions>
                </Dialog>
                    <Paper elevation={1} sx={isMobile ? {
                            p: 1.5,
                            mt: 2.5,
                            mb: 2.5,
                            overflowX: 'auto',
                            width: '100%'
                        } :
                        {p: 3, mt: 3, mb: 3, overflowX: 'auto', width: '39.17%'}}>
                        {isMobile ? undefined :
                            <Typography variant="h6" fontWeight={700} sx={{mb: 2.5}}>
                                Transaction History
                            </Typography>}
                        <TableContainer component={Paper} elevation={0} sx={{border: '1px solid', borderColor: 'divider'}}>
                            <Table stickyHeader aria-label="sticky table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{
                                            marginRight: '0px',
                                            paddingLeft: '5px',
                                            paddingRight: '0px'
                                        }} align="center">Status</TableCell>
                                        <TableCell sx={
                                            isMobile ? {} : {
                                            marginX: '0px',
                                            paddingX: '0px'
                                        }}>Date</TableCell>
                                        <TableCell sx={
                                            isMobile ? {} : {
                                            marginX: '0px',
                                            paddingX: '5px'
                                        }}>Description</TableCell>
                                        <TableCell sx={{
                                            marginLeft: '0px',
                                            paddingLeft: '0px'
                                        }} align="right">Amount</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {transactions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((transaction) => {
                                        const splitDate = transaction.authorized_date.split('-');
                                        const dateString = isMobile ? splitDate[1] + '-' + splitDate[2] : splitDate[1] + '-' + splitDate[2] + '-' + splitDate[0];

                                        return (
                                            <>
                                                <TableRow key={transaction.transaction_id}
                                                          onClick={() => handleRowClick(transaction)}
                                                          sx={{
                                                              cursor: 'pointer',
                                                              '&:hover': {backgroundColor: 'rgba(21, 42, 74, 0.04)'},
                                                          }}>

                                                    <TableCell sx={{marginX: '0px', paddingX: '0px', width: '15%'}}
                                                               align="center">{transaction.memo && transaction.receipt_key && transaction.internal_account ?
                                                        <CheckCircle sx={{color: 'success.main'}} fontSize="small"/> :
                                                        <RadioButtonUnchecked sx={{color: 'text.disabled'}} fontSize="small"/>}</TableCell>
                                                    <TableCell sx={
                                                        isMobile ? {
                                                            marginRight: '0px',
                                                            paddingRight: '0px',
                                                            width: '20%'
                                                        } :
                                                        {
                                                            marginX: '0px',
                                                            paddingX: '5px',
                                                            width: '15%'
                                                        }}><Typography fontSize={fontSize}>{dateString}</Typography></TableCell>
                                                    <TableCell sx={
                                                        isMobile ? {
                                                            marginX: '0px',
                                                            paddingX: '0px',
                                                            width: '55%'
                                                        } :
                                                        {
                                                            marginX: '0px',
                                                            paddingX: '5px',
                                                            width: '60%'
                                                        }}><Typography fontSize={fontSize}>{transaction.name}</Typography></TableCell>
                                                    <TableCell sx={
                                                        isMobile ? {
                                                            marginLeft: '0px',
                                                            paddingLeft: '0px',
                                                            width: '15%'
                                                        } :
                                                        {
                                                            marginLeft: '0px',
                                                            paddingLeft: '0px',
                                                            width: '15%'
                                                        }} align="right">
                                                        <Typography fontSize={fontSize}>{formatUSD(transaction.amount)}</Typography></TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell style={{paddingBottom: 0, paddingTop: 0}} colSpan={6}>
                                                        <Collapse in={openTransactionId === transaction.transaction_id}
                                                                  timeout="auto"
                                                                  unmountOnExit>
                                                            <Box sx={{
                                                                m: 1,
                                                                p: 2,
                                                                borderRadius: 2,
                                                                backgroundColor: '#F8FAFC',
                                                                border: '1px solid',
                                                                borderColor: 'divider',
                                                            }}>
                                                                <Typography variant="subtitle1" fontWeight={700}
                                                                            sx={{mb: 1}}>
                                                                    Edit Transaction
                                                                </Typography>
                                                                <FormControl color="primary"
                                                                             variant="outlined"
                                                                             fullWidth
                                                                             margin="normal">
                                                                    <InputLabel color="primary">Account</InputLabel>
                                                                    <Select
                                                                        labelId="label-for-account" label="Account"
                                                                        defaultValue={accountId ? +accountId : ""}
                                                                        onChange={(e) => setAccountId(+e.target.value === -1 ? null : +e.target.value)}>
                                                                        {[{
                                                                            id: -1,
                                                                            name: "<none>"
                                                                        }].concat(accounts).map(account => (
                                                                            <MenuItem
                                                                                key={account.id}
                                                                                value={account.id}><Typography
                                                                                sx={{paddingY: "0px"}}
                                                                                fontSize={isMobile ? 14 : 16}>{account.name}</Typography></MenuItem>
                                                                        ))}
                                                                    </Select>
                                                                </FormControl>
                                                                <TextField
                                                                    color="primary"
                                                                    value={memo}
                                                                    label="Memo"
                                                                    fullWidth margin="normal"
                                                                    onChange={(e) => setMemo(e.target.value)}/>

                                                                {isMobile ? (
                                                                    <>
                                                                        <Grid container justifyContent="space-between"
                                                                              alignItems="center">
                                                                            <Grid item>
                                                                                <Button variant="contained"
                                                                                        component="label"
                                                                                        color="primary" size="small">
                                                                                    Upload Receipt
                                                                                    <input type="file" hidden
                                                                                           onChange={handleFileChange}/>
                                                                                </Button>
                                                                            </Grid>
                                                                            <Grid item>
                                                                                {receiptUrl.length ? (
                                                                                    <Button size="small"
                                                                                            variant="contained"
                                                                                            color="primary"
                                                                                            onClick={openReceipt}>
                                                                                        View Receipt
                                                                                    </Button>
                                                                                ) : (
                                                                                    dataSaveLock ?
                                                                                        <CircularProgress
                                                                                            color={"primary"}/>
                                                                                        :
                                                                                        <Button
                                                                                            size="small"
                                                                                            variant="contained"
                                                                                            color="secondary"
                                                                                            onClick={() => handleSave(transaction)}>
                                                                                            Save
                                                                                        </Button>
                                                                                )}
                                                                            </Grid>
                                                                        </Grid>
                                                                        {receiptUrl.length ? (
                                                                            <Grid container
                                                                                  justifyContent="space-between"
                                                                                  alignItems="center" sx={{mt: 1}}>
                                                                                <Grid item>
                                                                                    <Tooltip title={"Delete Receipt"}>
                                                                                        <IconButton
                                                                                            color="error"
                                                                                            size="small"
                                                                                            onClick={() => setConfirmDialogOpen(true)}>
                                                                                            <Delete
                                                                                                fontSize="small"></Delete>
                                                                                        </IconButton></Tooltip>
                                                                                </Grid>
                                                                                <Grid item>
                                                                                    {dataSaveLock ?
                                                                                        <CircularProgress
                                                                                            color={"primary"}/>
                                                                                        :
                                                                                        <Button
                                                                                            size="small"
                                                                                            variant="contained"
                                                                                            color="secondary"
                                                                                            onClick={() => handleSave(transaction)}>
                                                                                            Save
                                                                                        </Button>
                                                                                    }
                                                                                </Grid>
                                                                            </Grid>
                                                                        ) : undefined}
                                                                    </>
                                                                ) : (
                                                                    <Grid container>
                                                                        <Grid item>
                                                                            <Button variant="contained"
                                                                                    component="label"
                                                                                    color="primary">
                                                                                Upload Receipt
                                                                                <input type="file" hidden
                                                                                       onChange={handleFileChange}/>
                                                                            </Button>
                                                                        </Grid>
                                                                        <Grid item>
                                                                            {receiptUrl.length ? (
                                                                                <><Button sx={{ml: 2}}
                                                                                          variant="contained"
                                                                                          color="primary"
                                                                                          onClick={openReceipt}>
                                                                                    View Receipt
                                                                                </Button>
                                                                                    {<Tooltip title={"Delete Receipt"}>
                                                                                        <IconButton color="error"
                                                                                                    sx={{ml: 2}}
                                                                                                    onClick={() => setConfirmDialogOpen(true)}>
                                                                                            <Delete></Delete>
                                                                                        </IconButton></Tooltip>}</>) : undefined}
                                                                        </Grid>
                                                                        <Grid item xs>
                                                                            <Grid container direction="row-reverse">
                                                                                {dataSaveLock ?
                                                                                    <CircularProgress
                                                                                        color={"primary"}/>
                                                                                    :
                                                                                    <Button variant="contained"
                                                                                            color="secondary"
                                                                                            onClick={() => handleSave(transaction)}>
                                                                                        Save
                                                                                    </Button>
                                                                                }
                                                                            </Grid>
                                                                        </Grid>
                                                                    </Grid>
                                                                )}
                                                                <Grid sx={{marginTop: '2px'}}>
                                                                    {file ? (
                                                                        <Typography>
                                                                            Selected File: {file.name}
                                                                        </Typography>
                                                                    ) : undefined}
                                                                    {fileError ? (
                                                                        <Typography color="error">
                                                                            {fileError}
                                                                        </Typography>
                                                                    ) : undefined}
                                                                </Grid>
                                                            </Box>
                                                        </Collapse>
                                                    </TableCell>
                                                </TableRow>
                                            </>
                                        );
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


                    </Paper></>)
    );
};

export default TransactionList;
