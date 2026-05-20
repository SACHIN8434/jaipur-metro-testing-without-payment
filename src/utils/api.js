// api.js – Auth API calls for Jaipur Metro App
import { encryptDataUsingNodePublicKey } from "./encryption";
 import { fetchNodeServerPublicKey } from "../service/fetchPublicKey";
import axios  from "axios";

// export const NODE_SERVER_URL = "http://192.168.100.45:8085";
export const NODE_SERVER_URL = "https://qr.jaipurmetrosmartcard.in:443";




// ─── Login ───────────────────────────────────────────────────────────────────

export async function loginWithPassword({ emailOrPhone, password, publicKey1 }) {

    const publicKey = await fetchNodeServerPublicKey();


  const data = await encryptDataUsingNodePublicKey(publicKey, {
    emailOrPhone,
    password,
  });
  console.log("login with emailOrPhone,password", emailOrPhone, password);
  console.log("encrypted is", data);
  const res = await fetch(`https://qr.jaipurmetrosmartcard.in/user/login-with-password`, {
    method: "POST",
     headers: { "Content-Type": "application/json; charset=UTF-8" },
    body: JSON.stringify({ data: data }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Login failed");
  }
  return res.json();
}

// ─── Sign-up: Step 1 – Send OTP ──────────────────────────────────────────────

export async function sendSignUpOtp({ identifier}) {
  console.log("identifier is", identifier);
  
  try {
    // ✅ Encrypt the payload

    const publicKey = await fetchNodeServerPublicKey();
    console.log("public key is",publicKey)
    const encrypted = await encryptDataUsingNodePublicKey(publicKey, {
      identifier,
    });
    console.log("encrypted data using public key is", encrypted);

    // ✅ Axios POST with try-catch
    const response = await axios.post(
      `https://qr.jaipurmetrosmartcard.in/user/send-sign-up-otp/v2`,
      { data: encrypted },
      {
        headers: { "Content-Type": "application/json; charset=UTF-8" },
        timeout: 10000, // 10 seconds timeout
      }
    );

    console.log("sendSignUpOtp response:", response.data);
    return response.data;

  } catch (error) {
    console.error("sendSignUpOtp error:", error);

    if (error.response) {
      // ❌ Server responded with error status (4xx, 5xx)
      console.error("Server error status:", error.response.status);
      console.error("Server error data:", error.response.data);
      throw new Error(error.response.data?.message || "Failed to send OTP");

    } else if (error.request) {
      // ❌ Request made but no response received (ERR_EMPTY_RESPONSE)
      console.error("No response received from server");
      throw new Error("Unable to reach server. Please try again.");

    } else {
      // ❌ Something went wrong before request was made
      console.error("Request setup error:", error.message);
      throw new Error(error.message || "Something went wrong");
    }
  }
}

// ─── Sign-up: Step 2 – Verify OTP ────────────────────────────────────────────

export async function verifyOtp({ identifier, otp, publicKey1 }) {
  

  const publicKey = await fetchNodeServerPublicKey();
  const encrypted = await encryptDataUsingNodePublicKey(publicKey, {
    identifier,
    otp,
  });
    console.log("public key is",publicKey)
  const res = await fetch(`${NODE_SERVER_URL}/user/verify-otp/v2`, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=UTF-8" },
    body: JSON.stringify({ data: encrypted.toString() }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "OTP verification failed");
  }
  return res.json();
}

// ─── Sign-up: Step 3 – Complete Registration ──────────────────────────────────

export async function completeSignup({
  email,
  phone,
  password,
  fullName,
  os = "web",
  publicKey1,
}) {
  try {
    console.log("Coming into completeSignup:", email, phone, fullName, os);

      const publicKey = await fetchNodeServerPublicKey();


    // 1️⃣ Encrypt
    let encrypted;
    try {
      encrypted = await encryptDataUsingNodePublicKey(publicKey, {
        os,
        phone,
        password,
        fullName,
        email,
      });
      console.log("Encryption successful:", encrypted);
    } catch (encryptErr) {
      console.error("Encryption failed:", encryptErr);
      throw new Error("Failed to encrypt data: " + encryptErr.message);
    }

    // 2️⃣ API call
    let response;
    try {
      response = await axios.post(
        `https://qr.jaipurmetrosmartcard.in/user/signup/web`,
        { data: encrypted },
        {
          headers: { "Content-Type": "application/json; charset=UTF-8" },
        }
      );
      console.log("Raw response:", response);
      console.log("Response status:", response.status);
      console.log("Response data:", response.data);
    } catch (axiosErr) {
      console.error("Network/axios error:", axiosErr);

      if (axiosErr.response) {
        // Server responded with error status (4xx, 5xx)
        throw new Error(
          axiosErr.response.data?.message ||
          `Signup failed with status ${axiosErr.response.status}`
        );
      }
      if (axiosErr.request) {
        // Request made but no response received
        throw new Error("Network error — could not reach server: " + axiosErr.message);
      }
      throw new Error("Unexpected error: " + axiosErr.message);
    }

    // 3️⃣ Return response data — axios auto parses JSON, no need to call .json()
    const responseData = response.data;
    console.log("Signup successful:", responseData);
    return responseData;

  } catch (err) {
    // ✅ Catches everything above
    console.error("completeSignup error:", err.message);
    throw err; // re-throw so the calling component can handle it
  }
}
