import React, {ReactElement, useEffect, useState} from 'react';
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
import {useAppDispatch, useAppSelector} from "./redux/store";
import {fetchAndClearTransactions, fetchTransactions, Transaction} from "./redux/transactionSlice";
import {Check, Close, Edit, Receipt} from "@mui/icons-material";
import {formatUSD} from "./helpers/formatUSD";
import {Account} from "./redux/accountSlice";
import {Viewer} from "@react-pdf-viewer/core";
import ImageViewer from "react-simple-image-viewer";
import {defaultLayoutPlugin, ToolbarProps} from "@react-pdf-viewer/default-layout";
import {getAWSPresignedFileExtension} from "./helpers/getAWSPresignedFileExtension";
import {useMediaQuery} from "react-responsive"
import {fetchUserList, selectActiveUsers} from "./redux/clientSlice";

interface AdminTableProps {
    transactions: Transaction[];
    accounts: Account[];
    count: number;
}

const AdminTable: React.FC<AdminTableProps> = ({transactions, accounts, count}) => {
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

    useEffect(() => {
        dispatch(fetchUserList());
    }, [dispatch])

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
            memo: memo
        }).then(() => {
            dispatch(fetchAndClearTransactions(transactionRequest));
        });
        setActiveTransactionId(""); // Close editing mode
    };

    const handleChangePage = (event: unknown, newPage: number) => {
        setPaginationLoading(true)
        setTransactionRequest({offset: 0, limit: (newPage + 1) * 50})
        if (((newPage + 1) * 50) > transactions.length) {
            dispatch(fetchTransactions({
                offset: newPage * 50,
                limit: 50,
            })).then(() => (
                setPage(newPage)
            ))
        } else {
            setPage(newPage)
        }
        setPaginationLoading(false)
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
                <Paper
                    style={{padding: '20px', marginTop: '20px', marginBottom: '20px', overflowX: 'auto', width: '70%'}}>
                    {/*<Typography variant="h6" style={{marginBottom: '20px'}}>*/}
                    {/*    Admin View*/}
                    {/*</Typography>*/}
                    {/*<Select labelId="label-for-account"*/}
                    {/*        defaultValue={""}*/}
                    {/*        onChange={(e) => setAccountId(+e.target.value)}>*/}
                    {/*    {users.map(user => (*/}
                    {/*        <MenuItem key={user.id}*/}
                    {/*                  value={user.id}>{user.first_name} {user.last_name} - {user.card_number}</MenuItem>*/}
                    {/*    ))}*/}
                    {/*</Select>*/}
                    <TableContainer component={Paper}>
                        <Table stickyHeader aria-label="sticky table">
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{color: "primary.main", marginX: '0px', paddingX: '0px'}}
                                               align="center">Status</TableCell>
                                    <TableCell
                                        sx={{color: "primary.main", marginX: '0px', paddingX: '0px'}}>Date</TableCell>
                                    <TableCell sx={{
                                        color: "primary.main",
                                        marginX: '0px',
                                        paddingX: '0px'
                                    }}>Description</TableCell>
                                    <TableCell
                                        sx={{color: "primary.main", marginX: '0px', paddingX: '0px'}}>Memo</TableCell>
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
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {transactions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((transaction) => {
                                    const account = accounts.find((a) => a.id === transaction.internal_account)
                                    const accountName = account ? account.name : ""
                                    const isEditable = activeTransactionId === transaction.transaction_id;
                                    return (
                                        <TableRow key={transaction.transaction_id}>
                                            <TableCell sx={{marginX: '0px', paddingX: '0px', width: '8%'}}
                                                       align="center">
                                                {transaction.memo && transaction.receipt_key && transaction.internal_account ?
                                                    <Check/> : <Close/>}</TableCell>
                                            <TableCell sx={{marginX: '0px', paddingX: '0px', width: '9%'}}>
                                                {transaction.date}
                                            </TableCell>
                                            <TableCell sx={{marginX: '0px', paddingX: '00px', width: '9%'}}>
                                                {transaction.name}
                                            </TableCell>
                                            <TableCell sx={{marginX: '0px', paddingX: '10px', width: '28%'}}>
                                                {<div style={{wordBreak: 'break-all'}}> {isEditable ? (
                                                    <TextField
                                                        size="medium"
                                                        focused
                                                        fullWidth
                                                        multiline
                                                        rows={4}
                                                        color='warning'
                                                        value={memo}
                                                        onChange={(e) => setMemo(e.target.value)}
                                                    />
                                                ) : transaction.memo} </div>}
                                            </TableCell>
                                            <TableCell sx={{marginX: '0px', paddingX: '0px', width: '12%'}}
                                                       align="center">
                                                {isEditable ? (
                                                    <FormControl variant="outlined" focused fullWidth color="warning">
                                                        <Select labelId="label-for-account"
                                                                defaultValue={accountId ? +accountId : ""}
                                                                onChange={(e) => setAccountId(+e.target.value)}>
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
                                                {transaction.account_owner}
                                            </TableCell>
                                            <TableCell sx={{marginX: '0px', paddingX: '0px', width: '9%'}}
                                                       align="right">
                                                {formatUSD(transaction.amount)}
                                            </TableCell>
                                            <TableCell sx={{marginX: '0px', paddingX: '0px', width: '9%'}}
                                                       align="center">
                                                {transaction.receipt_key && <IconButton
                                                    onClick={() => handleLoadReceipt(transaction)}><Receipt/></IconButton>}
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
                                                                            setActiveTransactionId("")

                                                                        }}><Close/></IconButton>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <IconButton onClick={() => {
                                                        setActiveTransactionId(transaction.transaction_id);
                                                        setMemo(transaction.memo)
                                                        setAccountId(transaction.internal_account)
                                                    }}><Edit/></IconButton>
                                                )}
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
                </Paper>)
        ))
};

export default AdminTable;
