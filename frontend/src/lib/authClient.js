// Local auth client to replace Supabase
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

class AuthClient {
  constructor() {
    this.listeners = [];
    this.currentSession = null;
    this.currentUser = null;
  }

  // Store session in localStorage
  _saveSession(session, user) {
    if (session && user) {
      localStorage.setItem("auth_token", session.access_token);
      localStorage.setItem("auth_user", JSON.stringify(user));
      this.currentSession = session;
      this.currentUser = user;
    } else {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      this.currentSession = null;
      this.currentUser = null;
    }
    this._notifyListeners(session, user);
  }

  // Get stored session
  async getSession() {
    const token = localStorage.getItem("auth_token");
    const userStr = localStorage.getItem("auth_user");
    
    if (!token || !userStr) {
      return { data: { session: null }, error: null };
    }

    try {
      // Verify token with server
      const response = await fetch(`${API_URL}/api/auth/session`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (data.session && data.user) {
        this.currentSession = data.session;
        this.currentUser = data.user;
        return { data: { session: data.session, user: data.user }, error: null };
      } else {
        this._saveSession(null, null);
        return { data: { session: null }, error: null };
      }
    } catch (error) {
      this._saveSession(null, null);
      return { data: { session: null }, error };
    }
  }

  // Sign in with email and password
  async signInWithPassword({ email, password }) {
    try {
      const response = await fetch(`${API_URL}/api/auth/signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { data: null, error: { message: data.error } };
      }

      this._saveSession(data.session, data.user);
      return { data: { session: data.session, user: data.user }, error: null };
    } catch (error) {
      return { data: null, error: { message: error.message } };
    }
  }

  // Sign up with email and password
  async signUp({ email, password }) {
    try {
      const response = await fetch(`${API_URL}/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { data: null, error: { message: data.error } };
      }

      // Don't auto-login after signup, user needs to login manually
      return { data: { user: data.user }, error: null };
    } catch (error) {
      return { data: null, error: { message: error.message } };
    }
  }

  // Sign out
  async signOut() {
    const token = localStorage.getItem("auth_token");
    
    try {
      if (token) {
        await fetch(`${API_URL}/api/auth/signout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error("Sign out error:", error);
    }

    this._saveSession(null, null);
    return { error: null };
  }

  // Listen to auth state changes
  onAuthStateChange(callback) {
    this.listeners.push(callback);
    
    // Return unsubscribe function
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            this.listeners = this.listeners.filter(cb => cb !== callback);
          },
        },
      },
    };
  }

  _notifyListeners(session, user) {
    this.listeners.forEach(callback => {
      callback("SIGNED_IN", session ? { session, user } : null);
    });
  }
}

// Create auth namespace similar to Supabase
export const auth = new AuthClient();

// Create a supabase-like object for compatibility
export const supabase = {
  auth,
};
