import axios from 'axios';


const API_BASE_URL = 'http://localhost:9000';

const apiAxios = axios.create({
    withCredentials: true,
});

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

