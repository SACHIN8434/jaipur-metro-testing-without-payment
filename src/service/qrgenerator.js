// api/stations.js
import axios from "axios";
import { Navigate } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const GO_BASE_URL = "https://qr.jaipurmetrosmartcard.in:8443";
export const fetchStations = async () => {
  try {
    const session = JSON.parse(localStorage.getItem("userSession"));

    console.log(`url is -> ${GO_BASE_URL}/fetch-station-names`);

    const res = await axios.get(`${GO_BASE_URL}/fetch-station-names`, {
      // headers: {
      //   "Content-Type": "application/json",
      //   ...(session?.sessionToken && {
      //     Authorization: `Bearer ${session.sessionToken}`,
      //   }),
      // },
    });
    console.log("res ", res);
    return res.data;
  } catch (err) {
    console.error("Error fetching stations:", err);
    throw err;
  }
};
export const fetchFare = async ({ sourceName, destinationName }) => {
  try {
    const session = JSON.parse(localStorage.getItem("userSession"));

    const res = await axios.get(`${GO_BASE_URL}/shortest-path`, {
      params: {
        source_name: sourceName,
        destination_name: destinationName,
      },
      // headers: {
      //   "Content-Type": "application/json",
      //   ...(session?.sessionToken && {
      //     Authorization: `Bearer ${session.sessionToken}`,
      //   }),
      // },
    });

    console.log("fare response:", res.data);
    return res.data;
  } catch (err) {
    console.error("Error fetching fare:", err);
    throw err;
  }
};

export const createPaymentOrder = async ({ totalFare }) => {
  try {
    // ✅ Debug localStorage first
    const raw = localStorage.getItem("userSession");
    console.log("Raw session from localStorage:", raw);

    const userSession = JSON.parse(raw);
    console.log("Parsed userSession:", userSession);

    if (!userSession) {
      console.warn("No user session found, redirecting...");
      window.location.href = "/login";
      return; // ✅ use return instead of throw after redirect
    }

    const { id, fullName, phone, sessionToken } = userSession;

    const payload = {
      amount: Number(totalFare),
      customerID: String(id),
      customerName: String(fullName),
      customerPhoneNumber: String(phone),
    };

    console.log("Create Order Payload:", payload); // ✅ now this will print

    const response = await axios.post(
      `https://qr.jaipurmetrosmartcard.in/api/payment/test/createOrder`,
      //`http://192.168.100.45:8085/api/payment/createOrder`,
      payload,
      // {
      //   headers: {
      //     "Content-Type": "application/json",
      //     Authorization: `Bearer ${sessionToken}`, // ✅ uncomment this
      //   },
      // }
    );

    console.log("Create Order Response:", response.data);
    return response.data;
  } catch (error) {
    // ✅ Always log the full error so nothing is silent
    console.error("createPaymentOrder failed:", error);

    if (error.response) {
      throw new Error(error.response.data?.message || "Payment service error");
    }
    if (error.request) {
      throw new Error("Unable to reach payment server");
    }
    throw new Error(error.message);
  }
};

export const fetchGoPublicKey = async () => {
  try {
    const res = await axios.get("/api/showPublicKey");

    // axios response data is already JSON
    const data = res.data;

    if (!data || !data.publicKey) {
      throw new Error("Public key not found in response");
    }

    return data.publicKey;
  } catch (error) {
    console.error(
      "❌ Failed to fetch Go public key:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

// ✅ Frontend — calls YOUR backend, not Cashfree directly
// export const verifyPayment = async (orderId) => {
//     try {
//         const response = await axios.get(
//             `http://192.168.100.45:8085/api/payment/verify/${orderId}` // ✅ 8085
//         );

//         console.log("Payment verification response:", response.data);
//         return response.data;

//     } catch (error) {
//         console.error("verifyPayment error:", error);

//         if (error.response) {
//             throw new Error(error.response.data?.error || "Payment verification failed");
//         }
//         if (error.request) {
//             throw new Error("Unable to reach payment server");
//         }
//         throw new Error(error.message);
//     }
// };

export const addJourney = async (encryptedData) => {
  try {
    // ✅ Backend expects { data: "base64string" }
    const body = { data: encryptedData };

    console.log("Sending body to addJourney:", body);

    const response = await axios.post(
      `http://192.168.100.45:8085/user/addJourney`,
      body,
      {
        headers: { "Content-Type": "application/json" },
      },
    );

    console.log("addJourney response:", response.data);
    return response.data;
  } catch (error) {
    console.error("addJourney error:", error);

    if (error.response) {
      throw new Error(error.response.data?.error || "Failed to add journey");
    }
    if (error.request) {
      throw new Error("Unable to reach journey server");
    }
    throw new Error(error.message);
  }
};

export const verifyPayment = async (orderId) => {
  try {
    const response = await axios.get(
      `https://qr.jaipurmetrosmartcard.in/api/payment/test/verify?orderId=${orderId}`,
    );
    return response.data; // { order_id, order_status, order_amount, isPaid }
  } catch (error) {
    console.error("verifyPayment error:", error);

    if (error.response) {
      throw new Error(
        error.response.data?.error || "Payment verification failed",
      );
    } else if (error.request) {
      throw new Error("Unable to reach server");
    } else {
      throw new Error(error.message || "Something went wrong");
    }
  }
};
