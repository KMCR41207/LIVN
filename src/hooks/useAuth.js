import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * Custom hook to access the AuthContext
 * Must be used within an AuthProvider
 * @throws {Error} If used outside of AuthProvider
 * @returns {import('../context/AuthContext').AuthContextType} Auth context value
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
