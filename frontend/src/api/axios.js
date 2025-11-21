import axios from "axios";
// Create an Axios instance with base URL and credentials
const api = axios.create({
  // Change the baseURL to your backend server URL
  baseURL: "http://localhost:5000/api",
  withCredentials: true,// Include cookies in requests
});

// Interceptors for handling token refresh
let isRefreshing = false;// Flag to indicate if token refresh is in progress
let failedQueue = [];// Queue to hold requests while token is being refreshed

// Function to process the queue of failed requests
const processQueue = (error, token = null) => {// Process each request in the failed queue
  failedQueue.forEach((prom) => {// Resolve or reject the promise based on the token refresh result
    if (error) prom.reject(error);// If there was an error, reject the promise
    else prom.resolve(token);// Otherwise, resolve with the new token 
  });
  failedQueue = [];// Clear the queue after processing it once done refreshing the token or there was an error
};

api.interceptors.response.use(// Interceptor for handling token refresh on 401 responses 
  (res) => res,// Return the response if successful
  async (err) => {// Handle errors
    const original = err.config;// Store the original request configuration

    if (err.response?.status === 401 && !original._retry) {// Check for 401 Unauthorized status and if the request has not been retried yet
      if (isRefreshing) {// If a token refresh is already in progress
        return new Promise(function (resolve, reject) {// Return a new promise that will be resolved or rejected once the token refresh is complete
          failedQueue.push({ resolve, reject });// Add the current request to the failed queue
        }).then((token) => {// Once the token is refreshed, retry the original request with the new token
          original.headers["Authorization"] = "Bearer " + token;// Set the new token in the request headers 
          return api(original);// Retry the original request
        });
      }

      original._retry = true;// Mark the request as retried to prevent infinite loops in case of multiple 401 responses 
      isRefreshing = true;// Set the refreshing flag to true to prevent multiple token refresh attempts at the same time 

      try {
        const res = await api.post("/auth/refresh_token");// Make a request to refresh the token
        const newToken = res.data.accessToken;// Extract the new access token from the response

        processQueue(null, newToken);// Process the queue of failed requests with the new token 
        isRefreshing = false;// Reset the refreshing flag 

        original.headers["Authorization"] = "Bearer " + newToken;// Set the new token in the original request headers 
        return api(original);// Retry the original request with the new token
      } catch (err2) {// Handle errors during token refresh
        processQueue(err2, null);// Process the queue with the error
        isRefreshing = false;// Reset the refreshing flag
        return Promise.reject(err2);// Reject the promise with the error
      }
    }
    return Promise.reject(err);// For other errors, simply reject the promise with the error 
  }
);

export default api;
