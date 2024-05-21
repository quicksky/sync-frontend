import React, {ChangeEvent, KeyboardEventHandler, ReactElement, useEffect, useState} from 'react';
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
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    SelectChangeEvent,
    Checkbox,
    CircularProgress,
    FormControlLabel,
    InputAdornment, createTheme, ThemeProvider, Tooltip
} from '@mui/material';
import {
    approveTransaction,
    getTransactionImage,
    GetTransactionRequest,
    getUserAccounts,
    grantAccount,
    revokeAccount,
    setTransactionInfo, unapproveTransaction, uploadTransactionFile
} from "./Backend";
import {useAppDispatch, useAppSelector} from "./redux/store";
import {
    fetchAdminTransactions,
    fetchAndClearAdminTransactions,
    fetchAndClearTransactions,
    fetchTransactions,
    selectCount,
    selectTransactions,
    Transaction
} from "./redux/transactionSlice";
import {Check, Close, Edit, Receipt, Search, Start, UploadFile} from "@mui/icons-material";
import {formatUSD} from "./helpers/formatUSD";
import {Account, fetchOwnAccounts} from "./redux/accountSlice";
import {Viewer} from "@react-pdf-viewer/core";
import ImageViewer from "react-simple-image-viewer";
import {defaultLayoutPlugin, ToolbarProps} from "@react-pdf-viewer/default-layout";
import {getAWSPresignedFileExtension} from "./helpers/getAWSPresignedFileExtension";
import {useMediaQuery} from "react-responsive"
import {fetchUserList, selectActiveUsers} from "./redux/clientSlice";
import {selectUser} from "./redux/userSlice";
import {DatePicker, LocalizationProvider} from "@mui/x-date-pickers";
import {theme} from "./App";
import {AdapterDateFns} from "@mui/x-date-pickers/AdapterDateFns";
import dayjs, {Dayjs} from "dayjs";
import SyncPDFViewer from "./components/SyncPDFViewer";
import syncPDFViewer from "./components/SyncPDFViewer";
import Avatar from "@mui/material/Avatar";
import SyncFileUpload from "./components/SyncFileUpload";
import Compress from "compress.js";
import {compressionValue, pdfFileType, supportedFileTypes} from "./helpers/fileInfo";

interface AdminTableProps {
    transactions: Transaction[];
    accounts: Account[];
    count: number;
}

const AdminTable: React.FC<AdminTableProps> = ({transactions, accounts, count}) => {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const user = useAppSelector(selectUser)
    const dispatch = useAppDispatch();
    const [page, setPage] = useState(0);
    const rowsPerPage = 50;
    const isMobile = useMediaQuery({maxWidth: 500})
    const [activeTransactionId, setActiveTransactionId] = useState<string>("");
    const [accountId, setAccountId] = useState<number | null>(null)
    const [memo, setMemo] = useState<string | null>('');
    const [isPdfViewerOpen, setPdfViewerOpen] = useState<boolean>(false);
    const [receiptUrl, setReceiptUrl] = useState<string>("");
    const [isImageViewerOpen, setImageViewerOpen] = useState<boolean>(false);
    const users = useAppSelector(selectActiveUsers);
    const [paginationLoading, setPaginationLoading] = useState<boolean>(false);
    const [transactionRequest, setTransactionRequest] = useState<GetTransactionRequest>({
        limit: 50,
        offset: 0,
        filters: {include_hidden: true}
    })
    const [markCompletedLoading, setMarkCompletedLoading] = useState<string | false>(false)
    const [userSelectBoxValue, setUserSelectBoxValue] = useState<string | undefined>(undefined)
    const compress = new Compress()
    const [uploadFileDialogOpen, setUploadFileDialogOpen] = useState<boolean>(false)
    const [uploadTransactionId, setUploadTransactionId] = useState<string>("")


    const newTheme = () => createTheme({
        ...theme,
        components: {
            MuiTextField: {
                defaultProps: {
                    size: "small",
                }
            }
        }
    })


    const onFileUpload = (file: File) => {
        uploadTransactionFile({id: uploadTransactionId, file: file}).then(() => {
            console.log('what')
            console.log(transactionRequest)
            dispatch(fetchAndClearAdminTransactions(transactionRequest));
            setUploadTransactionId("")
            setUploadFileDialogOpen(false)
        })
    };


    //filters
    const [adminApprovedOnly, setAdminApprovedOnly] = useState<boolean | undefined>(false)
    const handleAdminApprovedFilter = (checked: boolean) => {

    }

    const [searchString, setSearchString] = useState<string | undefined>("")


    const searchKeyDown = (e: { key: string }) => {
        if (e.key == 'Enter') {
            handleSearchFilter()
        }
    }
    const clearSearch = () => {
        setSearchString("")
        handleSearchFilter(true)
    }

    const searchChange = (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        setSearchString(e.target.value)
    }
    const handleSearchFilter = (clear?: boolean) => {
        setPage(0)
        setTransactionRequest({
            ...transactionRequest,
            filters: {
                ...transactionRequest.filters,
                search: clear ? "" : searchString
            }
        })
        dispatch(fetchAndClearAdminTransactions({
            ...transactionRequest,
            filters: {
                ...transactionRequest.filters,
                search: clear ? "" : searchString
            }
        }))
    }

    const [startDate, setStartDate] = useState<Dayjs | null>(null)
    const [endDate, setEndDate] = useState<Dayjs | null>(null)

    //this is dumb
    const handleStartDateChange = (date: Dayjs | null): void => {
        setStartDate(date);
        handleDateFilter({start_date: date ? date : undefined})
    };
    const handleEndDateChange = (date: Dayjs | null): void => {
        setEndDate(date);
        handleDateFilter({end_date: date ? date : undefined})
    };

    const dateFormat = "YYYY-MM-DD"

    const clearDates = () => {
        setStartDate(null)
        setEndDate(null)
        handleDateFilter({}, true)
    }

    const handleDateFilter = (overrideDates: { start_date?: Dayjs, end_date?: Dayjs }, clear?: boolean) => {
        const startDateString = !clear ? overrideDates.start_date ? overrideDates.start_date.format(dateFormat) : startDate?.format(dateFormat) : undefined
        const endDateString = !clear ? overrideDates.end_date ? overrideDates.end_date.format(dateFormat) : endDate?.format(dateFormat) : undefined
        setPage(0);
        setTransactionRequest({
            ...transactionRequest,
            filters: {
                ...transactionRequest.filters,
                dates: {
                    start_date: startDateString,
                    end_date: endDateString
                }
            }
        })
        dispatch(fetchAndClearAdminTransactions({
            ...transactionRequest,
            filters: {
                ...transactionRequest.filters,
                dates: {
                    start_date: startDateString,
                    end_date: endDateString
                }
            }
        }))
    }


    const handleUserFilter = (e: SelectChangeEvent<string | undefined>) => {
        setPage(0);
        setUserSelectBoxValue(e.target.value)
        setTransactionRequest({
            ...transactionRequest,
            filters: {
                ...transactionRequest.filters,
                user_card_number: e.target.value
            }
        })
        dispatch(fetchAndClearAdminTransactions({
            ...transactionRequest,
            filters: {
                ...transactionRequest.filters,
                user_card_number: e.target.value
            }
        }))
    }

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
    const handleSubmitEdit = (transactionId: string) => {
        setTransactionInfo({
            id: transactionId,
            account_id: accountId,
            memo: memo
        }).then(() => {
            dispatch(fetchAndClearAdminTransactions(transactionRequest));
        });
        setActiveTransactionId("");
    };

    const handleChangePage = (event: unknown, newPage: number) => {
        setPaginationLoading(true)
        setTransactionRequest({...transactionRequest, offset: 0, limit: (newPage + 1) * 50})
        if (((newPage + 1) * 50) > transactions.length) {
            dispatch(fetchAdminTransactions({
                ...transactionRequest,
                offset: newPage * 50,
                limit: 50,
            })).then(() => {
                setPage(newPage)
            })
        } else {
            setPage(newPage)
        }
        setPaginationLoading(false)
    };
    const closeImageViewer = () => {
        setImageViewerOpen(false);
    };

    const refreshTransactions = (callback: () => void) => {
        dispatch(fetchAndClearAdminTransactions(transactionRequest)).finally(callback)
    }

    const onTransactionCheckboxClick = (checked: boolean, transaction_id: string) => {
        setMarkCompletedLoading(transaction_id)
        checked ?
            approveTransaction(transaction_id).then(() => refreshTransactions(() => setMarkCompletedLoading(false))) :
            unapproveTransaction(transaction_id).then(() => refreshTransactions(() => setMarkCompletedLoading(false)))
    }


    return (
        isPdfViewerOpen ? (
            <SyncPDFViewer fileUrl={receiptUrl} onClose={() => setPdfViewerOpen(false)}/>
        ) : (
            isImageViewerOpen ? <Box sx={{mt: 50}}><ImageViewer
                src={[receiptUrl]}
                currentIndex={0}
                disableScroll={true}
                closeOnClickOutside={true}
                onClose={closeImageViewer}/></Box> : (
                <><SyncFileUpload open={uploadFileDialogOpen} onClose={() => {
                    setUploadFileDialogOpen(false)
                    setUploadTransactionId("")
                }} onSave={onFileUpload}/>
                    <Paper
                        style={{
                            padding: '20px',
                            marginTop: '20px',
                            marginBottom: '20px',
                            overflowX: 'auto',
                            width: '80%'
                        }}>
                        {/*<Typography variant="h6" style={{marginBottom: '20px'}}>*/}
                        {/*    Admin View*/}
                        {/*</Typography>*/}
                        <Box sx={{mb: 2}}>
                            <TextField
                                sx={{mr: 2}}
                                color={"secondary"}
                                placeholder={"Search Transactions"}
                                size="small"
                                value={searchString}
                                onChange={searchChange}
                                onKeyDown={searchKeyDown}
                                InputProps={{
                                    startAdornment: <InputAdornment
                                        position="start"><Search/></InputAdornment>,

                                    endAdornment: searchString ? <InputAdornment
                                        position={"end"}><IconButton
                                        onClick={() => clearSearch()}><Close/></IconButton></InputAdornment> : undefined
                                }}/>
                            <FormControl sx={{minWidth: "20%"}} size={"small"}>
                                {!transactionRequest.filters?.user_card_number ?
                                    <InputLabel>User</InputLabel> : undefined}
                                <Select
                                    color={"secondary"}
                                    size={"small"}
                                    value={userSelectBoxValue}
                                    onChange={handleUserFilter}>
                                    <MenuItem key={-1} value={undefined}>{"<none>"}</MenuItem>
                                    {users.map(user => (
                                        <MenuItem key={user.id}
                                                  value={user.card_number ? user.card_number : ""}>{user.first_name} {user.last_name} - {user.card_number}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <ThemeProvider theme={newTheme}>
                                <DatePicker
                                    sx={{ml: 2, maxWidth: "15%"}}
                                    label="Start Date"
                                    value={startDate}
                                    onChange={handleStartDateChange}
                                    name="start_date"
                                    format={"YYYY-MM-DD"}

                                ></DatePicker>
                                <DatePicker
                                    sx={{ml: 2, maxWidth: "15%"}}
                                    value={endDate}
                                    onChange={handleEndDateChange}
                                    label="End Date"
                                    name="end_date"
                                    format={"YYYY-MM-DD"}></DatePicker>
                            </ThemeProvider>
                            {startDate || endDate ?
                                <IconButton onClick={() => clearDates()}><Close/></IconButton> : undefined}
                        </Box>
                        <TableContainer component={Paper}>
                            <Table stickyHeader aria-label="sticky table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{color: "primary.main", marginX: '0px', paddingX: '0px'}}
                                                   align="center">Reviewed</TableCell>
                                        <TableCell sx={{color: "primary.main", marginX: '0px', paddingX: '0px'}}
                                                   align="center">Status</TableCell>
                                        <TableCell
                                            sx={{
                                                color: "primary.main",
                                                marginX: '0px',
                                                paddingX: '20px'
                                            }}>Date</TableCell>
                                        <TableCell sx={{
                                            color: "primary.main",
                                            marginX: '0px',
                                            paddingX: '0px'
                                        }}>Description</TableCell>
                                        <TableCell
                                            sx={{
                                                color: "primary.main",
                                                marginX: '0px',
                                                paddingX: '0px'
                                            }}>Memo</TableCell>
                                        <TableCell sx={{color: "primary.main", marginX: '0px', paddingX: '0px'}}
                                                   align="center">Account</TableCell>
                                        <TableCell sx={{color: "primary.main", marginX: '0px', paddingX: '0px'}}
                                                   align="right">Owner</TableCell>
                                        <TableCell sx={{color: "primary.main", marginX: '0px', paddingX: '0px'}}
                                                   align="right">Amount</TableCell>
                                        <TableCell sx={{color: "primary.main", marginX: '0px', paddingX: '0px'}}
                                                   align="center">Receipt</TableCell>
                                        <TableCell sx={{color: "primary.main", marginX: '0px', paddingX: '0px'}}
                                                   align='center'>Edit</TableCell>
                                        <TableCell sx={{color: "primary.main", marginX: '0px', paddingX: '10px'}}
                                                   align='center'>Upload</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {transactions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((transaction) => {
                                        const account = accounts.find((a) => a.id === transaction.internal_account);
                                        const accountName = account ? account.name : "";
                                        const isEditable = activeTransactionId === transaction.transaction_id;
                                        const card_number = transaction.account_owner.slice(-4);
                                        const owner = users.find(user => user.card_number === card_number);
                                        const splitDate = transaction.authorized_date.split('-');
                                        const dateString = splitDate[1] + '-' + splitDate[2] + '-' + splitDate[0];

                                        return (
                                            <TableRow key={transaction.transaction_id}
                                                      sx={{
                                                          "background-color": transaction.admin_approved ? "#acfcac" : "white",
                                                      }}>
                                                <TableCell align={"center"}
                                                           sx={{marginX: '0px', paddingX: '0px', width: '9%'}}>
                                                    <Checkbox sx={{
                                                        "&, & + .MuiFormControlLabel-label": {
                                                            color: "secondary.main"
                                                        }
                                                    }} color="secondary"
                                                              checked={transaction.admin_approved}
                                                              onChange={(evt) => onTransactionCheckboxClick(evt.target.checked, transaction.transaction_id)}/>
                                                </TableCell>
                                                <TableCell sx={{marginX: '0px', paddingX: '0px', width: '8%'}}
                                                           align="center">
                                                    {transaction.memo && transaction.receipt_key && transaction.internal_account ?
                                                        <Check/> : <Close/>}</TableCell>
                                                <TableCell sx={{marginX: '0px', paddingX: '0px', width: '9%'}}>
                                                    {dateString}
                                                </TableCell>
                                                <TableCell sx={{
                                                    marginX: '0px',
                                                    paddingX: '00px',
                                                    width: '9%'
                                                }}>
                                                    {transaction.name} {transaction.alias ? (
                                                    <b>({transaction.alias})</b>) : undefined}

                                                </TableCell>
                                                <TableCell sx={{marginX: '0px', paddingX: '10px', width: '28%'}}>
                                                    {<div style={{wordBreak: 'break-all'}}> {isEditable ? (
                                                        <TextField
                                                            style={{
                                                                wordBreak: 'normal', overflowWrap: 'break-word'
                                                            }}
                                                            size="medium"
                                                            focused
                                                            fullWidth
                                                            multiline
                                                            rows={4}
                                                            color='warning'
                                                            value={memo}
                                                            onChange={(e) => setMemo(e.target.value)}/>
                                                    ) : <Typography variant="body2"
                                                                    style={{
                                                                        wordBreak: 'normal', overflowWrap: 'break-word'
                                                                    }}>{transaction.memo}</Typography>} </div>}
                                                </TableCell>
                                                <TableCell sx={{marginX: '0px', paddingX: '0px', width: '12%'}}
                                                           align="center">
                                                    {isEditable ? (
                                                        <FormControl variant="outlined" focused fullWidth
                                                                     color="warning">
                                                            <Select labelId="label-for-account"
                                                                    defaultValue={accountId ? +accountId : ""}
                                                                    onChange={(e) => setAccountId(+e.target.value === -1 ? null : +e.target.value)}>
                                                                <MenuItem key={-1} value={-1}>{"<none>"}</MenuItem>
                                                                {accounts.map(account => (
                                                                    <MenuItem key={account.id}
                                                                              value={account.id}>{account.name}</MenuItem>
                                                                ))}
                                                            </Select>
                                                        </FormControl>
                                                    ) : accountName}
                                                </TableCell>
                                                <TableCell sx={{marginX: '0px', paddingX: '0px', width: '10%'}}
                                                           align="right">
                                                    {owner ? `${owner.first_name} ${owner.last_name} (${owner.card_number})` : transaction.account_owner}
                                                </TableCell>
                                                <TableCell sx={{marginX: '0px', paddingX: '0px', width: '9%'}}
                                                           align="right">
                                                    {formatUSD(transaction.amount)}
                                                </TableCell>
                                                <TableCell sx={{marginX: '0px', paddingX: '0px', width: '9%'}}
                                                           align="center">
                                                    {transaction.receipt_key &&
                                                        <Tooltip title={"View Receipt"}>
                                                            <IconButton
                                                                onClick={() => handleLoadReceipt(transaction)}><Receipt/></IconButton>
                                                        </Tooltip>}
                                                </TableCell>
                                                <TableCell sx={{marginX: '0px', paddingX: '0px', width: '6%'}}
                                                           align="center">
                                                    {isEditable ? (
                                                        <>
                                                            <div style={{display: 'flex', flexDirection: 'column'}}>
                                                                <IconButton sx={{margin: '0px', padding: '0px'}}
                                                                            onClick={() => handleSubmitEdit(transaction.transaction_id)}><Check/></IconButton>
                                                                <IconButton sx={{margin: '0px', padding: '0px'}}
                                                                            onClick={() => {
                                                                                setActiveTransactionId("");

                                                                            }}><Close/></IconButton>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <Tooltip title={"Edit Transaction"}>
                                                            <IconButton onClick={() => {
                                                                setActiveTransactionId(transaction.transaction_id);
                                                                setMemo(transaction.memo);
                                                                setAccountId(transaction.internal_account);
                                                            }}><Edit/></IconButton></Tooltip>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Tooltip title={"Upload Receipt"}>
                                                        <IconButton onClick={() => {
                                                            setUploadTransactionId(transaction.transaction_id)
                                                            setUploadFileDialogOpen(true)
                                                        }}>
                                                            <UploadFile/>
                                                        </IconButton>
                                                    </Tooltip>
                                                </TableCell>
                                            </TableRow>
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

        ))
};

export default AdminTable;