import axios from 'axios';
import {parseContentDispositionFilename} from "./helpers/parseContentDisposition";
import {Account} from "./redux/accountSlice";
import {GetClientUserListResponse} from "./redux/clientSlice";


const API_BASE_URL = 'https://service.quicksky.io';

const apiAxios = axios.create({
    withCredentials: true,
});


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

export const generateExport = async (dateRange: { start_date: string, end_date: string }): Promise<{
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

export const createUser = async (request: { role: number, first_name: string, last_name: string, card_number: number | null }) => {
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