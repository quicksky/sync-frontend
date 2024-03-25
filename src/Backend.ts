import axios from 'axios';
import {parseContentDispositionFilename} from "./helpers/parseContentDisposition";
import {Account} from "./redux/accountSlice";
import {GetClientUserListResponse} from "./redux/clientSlice";
import {Transaction} from "./redux/transactionSlice";
import {redirectToLogin} from "./helpers/redirectToLogin";


const API_BASE_URL = 'https://service.quicksky.io';
//const API_BASE_URL = 'http://localhost:9000';

const apiAxios = axios.create({
    withCredentials: true,
});


const post = async <A, B>(path: string, body: A): Promise<B> => {
    const endpoint = `${API_BASE_URL}/${path}`;
    const response = await apiAxios.post<B>(endpoint, body)
    console.log(response.status)
    if (response.status === 401) {
        redirectToLogin()
    }
    return response.data
}
const get = async <A>(path: string): Promise<A> => {
    const endpoint = `${API_BASE_URL}/${path}`;
    const response = await apiAxios.get(endpoint)
    if (response.status === 401) {
        redirectToLogin()
        return Promise.reject()
    } else {
        return response.data
    }
}

export interface TransactionFilters {
    dates?: {
        start_date: string,
        end_date: string,
    }
    include_payments?: boolean,
    user_card_number?: string
}

export interface GetTransactionRequest {
    limit: number;
    offset: number;
    filters?: TransactionFilters
}

export interface GetTransactionResponse {
    count: number,
    transactions: Transaction[]
}


// Login endpoint
export const loginUserApi = async (email: string, password: string) => {
    const endpoint = `${API_BASE_URL}/login`;
    const response = await apiAxios.post(endpoint, {email, password});
    return response.data
}

export const logoutUserApi = async () => {
    const endpoint = `${API_BASE_URL}/logout`;
    const response = await apiAxios.get(endpoint)
    return response.data
}

export const getUserApi = async () => {
    const endpoint = `${API_BASE_URL}/user/getUser`;
    const response = await apiAxios.get(endpoint)
    return response.data
}

export const generateLinkToken = async () => {
    const endpoint = `${API_BASE_URL}/plaid/generateLinkToken`
    const response = await apiAxios.get(endpoint)
    return response.data
}
export const generateRepairModeToken = async () => {
    const endpoint = `${API_BASE_URL}/plaid/generateRepairModeToken`
    const response = await apiAxios.get(endpoint)
    return response.data
}


export const getUserTransactions = async () => {
    const endpoint = `${API_BASE_URL}/transactions/getUserTransactions`
    const response = await apiAxios.get(endpoint)
    return response.data
}

export const getAdminTransactions = async () => {
    const endpoint = `${API_BASE_URL}/transactions/getAdminTransactions`
    const response = await apiAxios.get(endpoint)
    return response.data
}

export const getTransactions = async (request: GetTransactionRequest): Promise<GetTransactionResponse> => {
    const endpoint = `${API_BASE_URL}/transactions/getTransactions`
    const response = await apiAxios.post(endpoint, request)
    return response.data
    // return post<GetTransactionRequest, GetTransactionResponse>('transactions/getTransactions', request)
}

export const resetUserPassword = async (password: string, token: string) => {
    const endpoint = `${API_BASE_URL}/user/resetPassword`
    const response = await apiAxios.post(endpoint, {password, token})
    return response.data
}

export const exchangeToken = async (token: string) => {
    const endpoint = `${API_BASE_URL}/plaid/exchangeToken`
    const response = await apiAxios.post(endpoint, {token})
    return response.data
}

export const generateExport = async (dateRange: {
    start_date: string,
    end_date: string,
    user_card_number?: string
}): Promise<{
    fileName: string;
    data: BinaryData;
}> => {
    const endpoint = `${API_BASE_URL}/export/generateExport`
    return apiAxios.post(endpoint, dateRange, {responseType: "blob"}).then((res) => {
        console.log(res.headers)
        return {
            fileName: parseContentDispositionFilename(res.headers["content-disposition"]) || `test.xlsx`,
            data: res.data,
        }
    })
}

export const getClientAccounts = async (): Promise<Account[]> => {
    const endpoint = `${API_BASE_URL}/client/getAccounts`
    const response = await apiAxios.get(endpoint)
    return response.data
}

export const getOwnAccounts = async (): Promise<Account[]> => {
    const endpoint = `${API_BASE_URL}/user/getAccounts`
    const response = await apiAxios.get(endpoint)
    return response.data
}

export const grantAccount = async (req: { user_id: string, account_id: number }) => {
    const endpoint = `${API_BASE_URL}/user/grantAccount`
    const response = await apiAxios.post(endpoint, req)
    return response.data
}

export const revokeAccount = async (req: { user_id: string, account_id: number }) => {
    const endpoint = `${API_BASE_URL}/user/revokeAccount`
    const response = await apiAxios.post(endpoint, req)
    return response.data
}

export const getUserAccounts = async (req: { user_id: string }): Promise<Account[]> => {
    const endpoint = `${API_BASE_URL}/client/getUserAccounts`
    const response = await apiAxios.post(endpoint, req)
    return response.data
}

export const addClientAccounts = async (data: string) => {
    const endpoint = `${API_BASE_URL}/client/addBulkAccounts`
    const response = await apiAxios.post(endpoint, {data: data})
    return response.data
}

export const deleteClientAccount = async (id: number) => {
    const endpoint = `${API_BASE_URL}/client/deleteAccount`
    const response = await apiAxios.post(endpoint, {id: id})
    return response.data
}

export const getClientUserList = async (): Promise<GetClientUserListResponse> => {
    const endpoint = `${API_BASE_URL}/client/getUsers`
    const response = await apiAxios.get(endpoint)
    return response.data
}

export const inviteUser = async (user_id: number) => {
    const endpoint = `${API_BASE_URL}/client/inviteUser/${user_id}`
    await apiAxios.get(endpoint)
}

export const createUser = async (request: {
    role: number,
    first_name: string,
    last_name: string,
    email: string,
    card_number: number | null
}) => {
    const endpoint = `${API_BASE_URL}/user/createUser`
    const response = await apiAxios.post(endpoint, request)
    return response.data
}

export const setTransactionInfo = async (request: { id: string, account_id: number | null, memo: string | null }) => {
    const endpoint = `${API_BASE_URL}/transactions/setInfo`
    const response = await apiAxios.post(endpoint, request)
    return response.data
}

export const uploadTransactionFile = async (request: { id: string, file: File }) => {
    const endpoint = `${API_BASE_URL}/upload/${request.id}`
    const response = await apiAxios.post(endpoint, request.file, {headers: {"Content-Type": request.file.type}})
    return response.data
}

export const getTransactionImage = async (id: string) => {
    const endpoint = `${API_BASE_URL}/transactions/getTransactionImage/${id}`
    const response = await apiAxios.get(endpoint)
    return response.data['url']
}

export const syncTransactions = async () => {
    const endpoint = `${API_BASE_URL}/plaid/syncTransactions`
    const response = await apiAxios.get(endpoint)
    return response.data
}

export const deleteReceipt = async (id: string) => {
    const endpoint = `${API_BASE_URL}/upload/delete/${id}`
    const response = await apiAxios.get(endpoint)
    return response.data
}

export const initiatePasswordReset = async (email: string) => {
    const endpoint = `${API_BASE_URL}/user/initiatePasswordReset`
    const response = await apiAxios.post(endpoint, {email: email})
    return response.data
}

export const approveTransaction = async (id: string) => {
    const endpoint = `${API_BASE_URL}/transactions/approve/${id}`
    const response = await apiAxios.get(endpoint)
    return response.data
}
export const unapproveTransaction = async (id: string) => {
    const endpoint = `${API_BASE_URL}/transactions/unapprove/${id}`
    const response = await apiAxios.get(endpoint)
    return response.data
}

export const getVendorList = async () => {
    const endpoint = `${API_BASE_URL}/client/getVendors`
    const response = await apiAxios.get(endpoint)
    return response.data
}

export const addVendor = async (vendor_name: string) => {
    const endpoint = `${API_BASE_URL}/client/addVendor`
    const response = await apiAxios.post(endpoint, {vendor_name: vendor_name})
    return response.data
}

export const addVendorAlias = async (req: { vendor_id: number, vendor_alias: string, starts_with: boolean }) => {
    const endpoint = `${API_BASE_URL}/client/addVendorAlias`
    const response = await apiAxios.post(endpoint, {
        vendor_id: req.vendor_id,
        vendor_alias: req.vendor_alias,
        starts_with: req.starts_with
    })
    return response.data
}
export const deleteVendor = async (vendor_id: number) => {
    const endpoint = `${API_BASE_URL}/client/deleteVendor`
    const response = await apiAxios.post(endpoint, {vendor_id})
    return response.data
}
export const deleteVendorAlias = async (req: { vendor_id: number, vendor_alias: string }) => {
    const endpoint = `${API_BASE_URL}/client/deleteVendorAlias`
    const response = await apiAxios.post(endpoint, req)
    return response.data
}