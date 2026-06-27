import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_SERVER_URI || "http://localhost:3000/",
    withCredentials: true,
});

API.interceptors.request.use(
    (request) => {
        const token = localStorage.getItem("token");

        if (token) {
            request.headers.Authorization = `Bearer ${token}`;
        }

        return request;
    },
    (error) => Promise.reject(error)
);

API.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;  // Store the original request
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;  // Mark the request as retried

            let refreshResponse;
            try {
                refreshResponse = await API.post('/api/auth/refresh-token', {}, {
                    withCredentials: true, // Include cookies in the request
                });
            } catch (error) {
                if (
                    error.response?.data?.message ===
                    "Refresh token missing"
                ) {
                    alert("Your session cannot be renewed. Cookies may be disabled or your session has expired.");
                }

                localStorage.removeItem("user");
                window.location.href = "/login";
            }

            const newAccessToken = refreshResponse.data.token;

            localStorage.setItem("token", newAccessToken);

            return API(originalRequest);
        }

        return Promise.reject(error);
    }
);

export default API;