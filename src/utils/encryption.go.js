// src/utils/encryption.go.js
// MATCHES Flutter encryptDataUsingGoPublicKey EXACTLY

import CryptoJS from "crypto-js";

// ─────────────────────────────────────────────
// Import RSA public key using forge
// ─────────────────────────────────────────────
import forge from "node-forge";

function importGoRSAPublicKey(publicKeyPem) {
  return forge.pki.publicKeyFromPem(publicKeyPem);
}

// ─────────────────────────────────────────────
// MAIN ENCRYPT FUNCTION (MOBILE-COMPATIBLE)
// ─────────────────────────────────────────────
export async function encryptForGoServer(publicKeyPem, payload) {
  // 1️⃣ Generate AES key (32 bytes)
  const aesKeyBytes = CryptoJS.lib.WordArray.random(32);
  const aesKeyBase64 = CryptoJS.enc.Base64.stringify(aesKeyBytes);

  // 2️⃣ Generate IV (16 bytes)
  const ivBytes = CryptoJS.lib.WordArray.random(16);

  // 3️⃣ AES-256-CBC encrypt payload
  const encryptedData = CryptoJS.AES.encrypt(
    JSON.stringify(payload),
    aesKeyBytes,
    {
      iv: ivBytes,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    }
  );

  // 4️⃣ RSA encrypt AES key (PKCS1 v1.5)
  const rsaPublicKey = importGoRSAPublicKey(publicKeyPem);
  const encryptedAesKeyBytes = rsaPublicKey.encrypt(
    aesKeyBase64,
    "RSAES-PKCS1-V1_5"
  );

  // 5️⃣ Return payload EXACTLY like mobile
  return {
    encryptedData: CryptoJS.enc.Base64.stringify(encryptedData.ciphertext),
    encryptedKey: forge.util.encode64(encryptedAesKeyBytes),
    iv: CryptoJS.enc.Base64.stringify(ivBytes),
  };
}