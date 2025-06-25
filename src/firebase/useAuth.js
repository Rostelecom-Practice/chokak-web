import { useState, useEffect } from 'react';
import { auth } from '../firebase/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const getAuthData = async () => {
    if (!user) return null;
    try {
      const idToken = await user.getIdToken();
      return {
        localId: user.uid,
        idToken
      };
    } catch (error) {
      console.error("Error getting auth data:", error);
      return null;
    }
  };

  return { user, loading, getAuthData };
};