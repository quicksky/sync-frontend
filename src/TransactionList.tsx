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
    DialogActions, Dialog
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
import {Check, Close, Delete, Receipt, Remove, Upload} from "@mui/icons-material";
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


const compressionValue = 0.35
const supportedFileTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"]
const pdfFileType = "application/pdf"

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
    const [memo, setMemo] = useState<string | null>(null);
    const [accountId, setAccountId] = useState<number | null>(null)
    const rowsPerPage = 50;
    const [isViewerOpen, setViewerOpen] = useState<boolean>(false)
    const [isPdfViewerOpen, setPdfViewerOpen] = useState<boolean>(false);
    const [receiptUrl, setReceiptUrl] = useState<string>("");
    const [receiptIsPDF, setReceiptIsPDF] = useState<boolean>(false);
    const uploadReceiptInput = useRef<HTMLInputElement>(null);
    const isMobile = useMediaQuery({maxWidth: 500})
    const [confirmDialogOpen, setConfirmDialogOpen] = useState<boolean>(false)
    const [dataSaveLock, setDataSaveLock] = useState<boolean>(false)
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

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const originalFile = event.target.files ? event.target.files[0] : null

        originalFile && supportedFileTypes.includes(originalFile.type) && (originalFile.type != pdfFileType) ? compress.compress([originalFile], {
            size: 1,
            quality: compressionValue,
            resize: false
        }).then((data) => {
            const img = data[0];
            const base64str = img.data;
            const imgExt = img.ext;
            const file = Compress.convertBase64ToFile(base64str, imgExt);
            setFile({file, name: originalFile.name})
        }) : originalFile && setFile({file: originalFile, name: originalFile.name})
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

                    plugins={[defaultLayoutPluginInstance, pageStuff]}
                    fileUrl={receiptUrl}
                />
                <Button onClick={() => setPdfViewerOpen(false)}>Close</Button>
            </div>

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
                        <Button variant={'contained'} onClick={() => {
                            setConfirmDialogOpen(false)
                        }}>Cancel</Button>
                        <Button variant={'contained'} color={'secondary'}
                                onClick={() => handleDelete(openTransactionId ? openTransactionId : "")}>Ok</Button>
                    </DialogActions>
                </Dialog><Paper style={isMobile ? {
                        padding: '10px',
                        marginTop: '20px',
                        marginBottom: '20px',
                        overflowX: 'auto',
                        width: '100%'
                    } :
                    {padding: '20px', marginTop: '20px', marginBottom: '20px', overflowX: 'auto', width: '40%'}}>
                    {isMobile ? undefined :
                        <Typography variant="h6" style={{marginBottom: '20px'}}>
                            Transaction History
                        </Typography>}
                    <TableContainer component={Paper}>
                        <Table stickyHeader aria-label="sticky table">
                            <TableHead>
                                <TableRow>
                                    {isMobile ? undefined :
                                        <TableCell sx={{color: "primary.main", marginRight: '0px', padding: '0px'}}
                                                   align="center">Status</TableCell>}
                                    <TableCell sx={isMobile ? {
                                            color: "primary.main",
                                            marginRight: '0px',
                                            paddingRight: '0px'
                                        } :
                                        {color: "primary.main", marginX: '0px', paddingX: '0px'}}>Date</TableCell>
                                    <TableCell sx={{
                                        color: "primary.main",
                                        marginX: '0px',
                                        paddingX: '0px'
                                    }}>Description</TableCell>
                                    <TableCell sx={{color: "primary.main", marginLeft: '0px', paddingLeft: '0px'}}
                                               align="right">Amount</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {transactions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((transaction) => {
                                    const splitDate = transaction.authorized_date.split('-');
                                    const dateString = splitDate[1] + '-' + splitDate[2] + '-' + splitDate[0];

                                    return (
                                        <>
                                            <TableRow key={transaction.transaction_id}
                                                      onClick={() => handleRowClick(transaction)}
                                                      style={{cursor: 'pointer'}}>
                                                {isMobile ? undefined :
                                                    <TableCell sx={{marginX: '0px', paddingX: '0px', width: '15%'}}
                                                               align="center">{transaction.memo && transaction.receipt_key && transaction.internal_account ?
                                                        <Check/> : <Remove/>}</TableCell>}
                                                <TableCell
                                                    sx={isMobile ? {
                                                            marginRight: '0px',
                                                            paddingRight: '0px',
                                                            width: '30%'
                                                        } :
                                                        {
                                                            marginX: '0px',
                                                            paddingX: '0px',
                                                            width: '15%'
                                                        }}>{dateString}</TableCell>
                                                <TableCell
                                                    sx={isMobile ? {marginX: '0px', paddingX: '0px', width: '55%'} :
                                                        {
                                                            marginX: '0px',
                                                            paddingX: '0px',
                                                            width: '60%'
                                                        }}>{transaction.name}</TableCell>
                                                <TableCell
                                                    sx={isMobile ? {
                                                            marginLeft: '0px',
                                                            paddingLeft: '0px',
                                                            width: '15%'
                                                        } :
                                                        {marginLeft: '0px', paddingLeft: '0px', width: '15%'}}
                                                    align="right">{formatUSD(transaction.amount)}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell style={{paddingBottom: 0, paddingTop: 0}} colSpan={6}>
                                                    <Collapse in={openTransactionId === transaction.transaction_id}
                                                              timeout="auto"
                                                              unmountOnExit>
                                                        <Box margin={1}>
                                                            <Grid container>
                                                                <Grid item>
                                                                    <Typography variant="h6" gutterBottom
                                                                                component="div">
                                                                        Edit Transaction
                                                                    </Typography>
                                                                </Grid>
                                                                {isMobile ?
                                                                    <Grid item xs>
                                                                        <Grid container direction="row-reverse">
                                                                            {transaction.memo && transaction.receipt_key && transaction.internal_account ?
                                                                                <Check/> : <Remove/>}
                                                                        </Grid>
                                                                    </Grid>
                                                                    : undefined}
                                                            </Grid>
                                                            <FormControl focused color="secondary"
                                                                         variant="outlined"
                                                                         fullWidth
                                                                         margin="normal">
                                                                <InputLabel color="secondary"
                                                                            sx={{input: {color: 'secondary.main'}}}>Account</InputLabel>
                                                                <Select labelId="label-for-account" label="Account"
                                                                        defaultValue={accountId ? +accountId : ""}
                                                                        onChange={(e) => setAccountId(+e.target.value === -1 ? null : +e.target.value)}>
                                                                    {[{
                                                                        id: -1,
                                                                        name: "<none>"
                                                                    }].concat(accounts).map(account => (
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

                                                            <Grid container>
                                                                <Grid item>
                                                                    <Button variant="contained" component="label"
                                                                            color="primary"
                                                                            size={isMobile ? "small" : undefined}>
                                                                        Upload Receipt
                                                                        <input type="file" hidden
                                                                               onChange={handleFileChange}/>
                                                                    </Button>
                                                                </Grid>
                                                                {isMobile ?
                                                                    <Grid item xs>
                                                                        <Grid container direction="row-reverse">
                                                                            {receiptUrl.length ? (
                                                                                <><Button sx={{ml: 2}} size="small"
                                                                                          variant="contained"
                                                                                          color="primary"
                                                                                          onClick={openReceipt}>
                                                                                    View Receipt
                                                                                </Button>

                                                                                    {<Tooltip title={"Delete Receipt"}>
                                                                                        <IconButton color="secondary"
                                                                                                    sx={{ml: 2}}
                                                                                                    onClick={() => handleDelete(transaction.transaction_id)}>
                                                                                            <Delete></Delete>
                                                                                        </IconButton></Tooltip>}</>) : undefined}
                                                                        </Grid>
                                                                    </Grid>
                                                                    :
                                                                    <Grid item>
                                                                        {receiptUrl.length ? (
                                                                            <><Button sx={{ml: 2}}
                                                                                      variant="contained"
                                                                                      color="primary"
                                                                                      onClick={openReceipt}>
                                                                                View Receipt
                                                                            </Button>
                                                                                {<Tooltip title={"Delete Receipt"}>
                                                                                    <IconButton color="secondary"
                                                                                                sx={{ml: 2}}
                                                                                                onClick={() => setConfirmDialogOpen(true)}>
                                                                                        <Delete></Delete>
                                                                                    </IconButton></Tooltip>}</>) : undefined}
                                                                    </Grid>}
                                                                {/*not good */}
                                                                {isMobile ?
                                                                    <Grid container justifyContent="right"
                                                                          sx={{marginTop: '5px'}}>
                                                                        {dataSaveLock ?
                                                                            <CircularProgress color={"secondary"}/>
                                                                            :
                                                                            <Button
                                                                                size={isMobile ? "small" : undefined}
                                                                                variant="contained" color="secondary"
                                                                                onClick={() => handleSave(transaction)}>
                                                                                Save
                                                                            </Button>
                                                                        }
                                                                    </Grid>
                                                                    :
                                                                    <Grid item xs>
                                                                        <Grid container direction="row-reverse">
                                                                            {dataSaveLock ?
                                                                                <CircularProgress color={"secondary"}/>
                                                                                :
                                                                                <Button variant="contained"
                                                                                        color="secondary"
                                                                                        onClick={() => handleSave(transaction)}>
                                                                                    Save
                                                                                </Button>
                                                                            }
                                                                        </Grid>
                                                                    </Grid>}
                                                            </Grid>
                                                            <Grid sx={{marginTop: '2px'}}>
                                                                {file ? (
                                                                    <Typography>
                                                                        Selected File: {file.name}
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
