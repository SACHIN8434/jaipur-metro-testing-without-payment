import { useState, useEffect } from "react";
import { GO_PUBLIC_KEY } from "../constant/goPublicKey";

const KEY_STORAGE = "goPublicKey";

export function useGoPublicKey() {
  const [publicKey, setPublicKey] = useState(
    () => sessionStorage.getItem(KEY_STORAGE) || null
  );
  const [loading, setLoading] = useState(!publicKey);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (publicKey) return;

    try {
      sessionStorage.setItem(KEY_STORAGE, GO_PUBLIC_KEY);
      setPublicKey(GO_PUBLIC_KEY);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [publicKey]);

  return { publicKey, loading, error };
}