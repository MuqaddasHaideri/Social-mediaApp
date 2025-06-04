
import { auth } from '@/firebase';
import { useRouter } from 'expo-router';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext<{
  user: User | null;
  loading: boolean;

}>({
  user: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    console.log('authprovider useE');

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      console.log('user>>>>>>>', firebaseUser);

      setUser(firebaseUser);
      setLoading(false);

      if (firebaseUser) {
        console.log('already login. nav to tabs');
        router.replace('/(tabs)');
      } else {
        console.log('first time login');
        router.replace('/welcome');
      }
    });

    return () => {
     
      unsubscribe();
    };
  }, []);
  const logout = async () => {
    try {
      await signOut(auth);
      console.log('logoutttt/////');
      router.replace('/welcome');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
