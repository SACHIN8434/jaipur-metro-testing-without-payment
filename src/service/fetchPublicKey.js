import axios from "axios";

// constants.js or config.js — create this file
export const NODE_SERVER_URL = import.meta.env.VITE_NODE_SERVER_URL;
export const GO_SERVER_URL   = import.meta.env.VITE_GO_SERVER_URL;

export const fetchNodeServerPublicKey = async () => {
    try {
        const response = await axios.get(
            `https://qr.jaipurmetrosmartcard.in/fetchPublicKey`,
            {
                timeout: 10000, // 10 seconds
            }
        );

        console.log("Node server public key response:", response.data);
        return response.data;

    } catch (error) {
        console.error("fetchNodeServerPublicKey error:", error);

        if (error.response) {
            // Server responded with error status
            console.error("Server error status:", error.response.status);
            console.error("Server error data:", error.response.data);
            throw new Error(error.response.data?.message || "Failed to fetch public key");

        } else if (error.request) {
            // Request made but no response
            console.error("No response received from server");
            throw new Error("Unable to reach server to fetch public key");

        } else {
            // Error before request was made
            console.error("Request setup error:", error.message);
            throw new Error(error.message || "Something went wrong");
        }
    }
};




export const fetchGoServerPublicKey = async () => {
    try {
        const response = await axios.get(
            `${GO_SERVER_URL}/showPublicKey`,
            {
                timeout: 10000, // 10 seconds
            }
        );

        console.log("Go server public key response:", response.data);
        return response.data;

    } catch (error) {
        console.error("fetchGoServerPublicKey error:", error);

        if (error.response) {
            console.error("Server error status:", error.response.status);
            console.error("Server error data:", error.response.data);
            throw new Error(error.response.data?.message || "Failed to fetch Go server public key");

        } else if (error.request) {
            console.error("No response received from Go server");
            throw new Error("Unable to reach Go server to fetch public key");

        } else {
            console.error("Request setup error:", error.message);
            throw new Error(error.message || "Something went wrong");
        }
    }
};