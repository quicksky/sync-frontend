import axios from 'axios';


const API_BASE_URL = 'http://localhost:9000';

const apiAxios = axios.create({
    withCredentials: true,
});

export interface Transaction {
    transaction_id: string;
    client_id: number,
    account_id: string,
    account_owner: string,
    date: string; // or Date
    name: string;
    pending: boolean,
    amount: number
    // Add other fields as necessary
}


// Login endpoint
export const loginUserApi = async (email: string, password: string) => {
    const endpoint = `${API_BASE_URL}/login`;
    const response = await apiAxios.post(endpoint, {email, password});
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

export const getUserTransactions = async () => {
    const endpoint = `${API_BASE_URL}/transactions/getUserTransactions`
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