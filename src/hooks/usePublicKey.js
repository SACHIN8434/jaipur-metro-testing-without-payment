// usePublicKey.js
import { useState, useEffect } from 'react';
// import { fetchNodePublicKey } from '../utils/api';

const KEY_STORAGE = 'nodePublicKey';

export function usePublicKey() {
  const [publicKey, setPublicKey] = useState(
    () => sessionStorage.getItem(KEY_STORAGE) || null
  );
  const [loading, setLoading] = useState(!publicKey);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (publicKey) return; // already cached in session
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        //const key = await fetchNodePublicKey();
        if (!cancelled) {
          // sessionStorage.setItem(KEY_STORAGE, key);
          // setPublicKey(key);
        }
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [publicKey]);

  return { publicKey, loading, error };
}