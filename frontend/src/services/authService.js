import axiosConfig from "../api/axiosConfig";

const login = async (credentials) => {

    const response = await axiosConfig.post(
        "/auth/login",
        credentials
    );

    return response.data;
};

const register = async (userData) => {

    const response = await axiosConfig.post(
        "/auth/register",
        userData
    );

    return response.data;
};

export default {
    login,
    register
};