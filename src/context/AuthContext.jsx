import { createContext, useContext, useState, useEffect } from 'react'
import usersData from '../data/users.json'

const AuthContext = createContext(null)

// ─── Default to first user (viewer) on load ───────────────────────
// TODO (API integration): Replace `currentUser` state with a fetch to
//   GET /api/auth/me  →  { id, name, role, avatar }
// and remove the usersData import + switcher entirely.
const DEFAULT_USER = usersData.find(u => u.role === 'user')

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('calendarCurrentUser')
    if (saved) return JSON.parse(saved)
    const { password: _pw, ...safe } = DEFAULT_USER
    return safe
  })

  // Persist selected user across refreshes (For Demo Only)
  useEffect(() => {
    localStorage.setItem('calendarCurrentUser', JSON.stringify(currentUser))
  }, [currentUser])

  // =========================================================================
  // 🚀 BACKEND DEVELOPER INSTRUCTIONS:
  // Jab API ready ho jaye, toh neeche wale code ko uncomment kar dena.
  // API URL ko change karna, aur upar wala localStorage logic hata dena.
  // Dropdown se "switchUser" function bhi tab use nahi hoga.
  // =========================================================================
  /*
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        // Change this URL to your actual backend endpoint
        const API_URL = 'https://your-domain.com/api/auth/me';
        
        const response = await fetch(API_URL, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // 'Authorization': 'Bearer ' + localStorage.getItem('token') // If using tokens
          }
        });
        
        if (response.ok) {
          const userData = await response.json();
          // Backend should return JSON like:
          // { "id": "1", "name": "Ses Priya", "role": "admin", "avatar": "SP" }
          setCurrentUser(userData);
        } else {
          // If not logged in or error, fallback to normal user
          setCurrentUser({ name: 'Guest User', role: 'user', avatar: '?' });
        }
      } catch (error) {
        console.error('Failed to fetch user role:', error);
        setCurrentUser({ name: 'Error', role: 'user', avatar: '?' });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserRole();
  }, []);
  */
  // =========================================================================

  // Switch user from the dropdown
  const switchUser = (userId) => {
    const found = usersData.find(u => u.id === userId)
    if (!found) return
    const { password: _pw, ...safe } = found
    setCurrentUser(safe)
  }

  const isAdmin   = currentUser?.role === 'admin'
  const isLoggedIn = !!currentUser

  return (
    <AuthContext.Provider value={{ currentUser, isAdmin, isLoggedIn, switchUser, users: usersData.map(({ password: _pw, ...u }) => u) }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
