async function importPublicKey(publicKeyPem) {
  const pemContents = publicKeyPem
    .replace('-----BEGIN PUBLIC KEY-----', '')
    .replace('-----END PUBLIC KEY-----', '')
    .replace(/\s/g, '');

  const binaryDer = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));

  return crypto.subtle.importKey(
    'spki',
    binaryDer.buffer,
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    false,
    ['encrypt']
  );
}

// export async function encryptDataUsingNodePublicKey(publicKeyPem, data) {
//   console.log("public key is",publicKeyPem,data)
//   console.log('🔐 Using Web Crypto OAEP encryption'); // ← add this
//   const key = await importPublicKey(publicKeyPem);
//   const encoded = new TextEncoder().encode(JSON.stringify(data));
//   const encryptedBuffer = await crypto.subtle.encrypt({ name: 'RSA-OAEP' }, key, encoded);
//   return btoa(String.fromCharCode(...new Uint8Array(encryptedBuffer)));
// }


import forge from 'node-forge';

export async function encryptDataUsingNodePublicKey(publicKeyPem, data) {
  console.log("public key is", publicKeyPem, data);
  console.log('🔐 Using node-forge RSA-OAEP encryption');

  try {
    // ✅ Works on HTTP, HTTPS, localhost, and IP addresses
    const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);

    const encrypted = publicKey.encrypt(
      JSON.stringify(data),
      'RSA-OAEP',
      {
        md: forge.md.sha1.create(),      // SHA-256 hash
        mgf1: { md: forge.md.sha1.create() }
      }
    );

    return forge.util.encode64(encrypted); // returns base64 string
  } catch (err) {
    console.error('Encryption failed:', err);
    throw new Error('Failed to encrypt data: ' + err.message);
  }
}


// import forge from 'node-forge';

// export async function encryptDataUsingNodePublicKey(publicKeyPem, data) {
//   console.log('🔐 Using PKCS#1 v1.5 encryption');

//   try {
//     const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);

//     const encrypted = publicKey.encrypt(
//       JSON.stringify(data),
//       'RSAES-PKCS1-V1_5'  // ← PKCS#1 v1.5
//     );

//     return forge.util.encode64(encrypted);
//   } catch (err) {
//     console.error('Encryption failed:', err);
//     throw new Error('Failed to encrypt data: ' + err.message);
//   }
// }
