import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  timeout: 120000
});

// Request interceptor to attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor to sanitize and humanize all error messages
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 1. Connection / Timeout Errors
    if (!error.response) {
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        error.userMessage = "The request took longer than expected. Please try again.";
      } else {
        error.userMessage = "Unable to connect to the server. Please check your network connection.";
      }
      return Promise.reject(error);
    }

    const status = error.response.status;
    const serverMessage = error.response.data?.message;

    // 2. High traffic / AI rate limits
    if (status === 503 || status === 429) {
      error.userMessage = "Our AI health assistant is receiving a lot of questions right now. Please wait a moment and try again.";
    } 
    // 3. Not found
    else if (status === 404) {
      error.userMessage = serverMessage || "The requested report or information could not be found.";
    } 
    // 4. Client validation
    else if (status === 400) {
      error.userMessage = serverMessage || "Please check your input and try again.";
    } 
    // 5. Auth
    else if (status === 401) {
      error.userMessage = "Your session has expired. Please sign in again.";
    } 
    // 6. Generic server errors (hide stack traces and tech details)
    else {
      error.userMessage = serverMessage && !serverMessage.toLowerCase().includes('mongo') && !serverMessage.toLowerCase().includes('key')
        ? serverMessage
        : "I'm having trouble generating a response right now. Please try again in a moment.";
    }

    return Promise.reject(error);
  }
);

export default api;