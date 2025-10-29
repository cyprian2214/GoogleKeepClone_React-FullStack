import React, { useState } from "react";
import { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "../firebase";
import GoogleIcon from "@mui/icons-material/Google";
import FacebookIcon from "@mui/icons-material/Facebook";
import AppleIcon from "@mui/icons-material/Apple";
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';

export default function LoginPage({ show, onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const getErrorMessage = (code) => {
    switch (code) {
      case 'auth/invalid-credential':
        return 'Invalid email or password. Please try again or create an account.';
      case 'auth/user-not-found':
        return 'No account found with this email. Please sign up.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/email-already-in-use':
        return 'An account already exists with this email. Please sign in.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters long.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      default:
        return 'An error occurred. Please try again.';
    }
  };

  async function handleAuth(e) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      setEmail("");
      setPassword("");
      onClose();
    } catch (err) {
      console.error(err);
      setError(getErrorMessage(err.code));
    } finally {
      setIsLoading(false);
    }
  }

  if (!show) return null;

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <img
            src="https://www.gstatic.com/images/branding/product/1x/keep_2020q4_48dp.png"
            alt="Google Keep"
          />
        </div>
        <h1>{isSignUp ? 'Create account' : 'Sign in with email'}</h1>
        <p className="auth-subtitle">
          Make a new doc to bring your words, data,<br />
          and teams together. For free
        </p>
        
        {error && <div className="auth-error">{error}</div>}
        
        <form onSubmit={handleAuth} className="auth-form">
          <div className="input-group">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Email"
              disabled={isLoading}
            />
          </div>
          
          <div className="input-group">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="Password"
              disabled={isLoading}
            />
            <div 
              className="password-toggle" 
              onClick={() => setShowPassword(!showPassword)}
              role="button"
              tabIndex={0}
            >
              {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
            </div>
          </div>

          <div className="forgot-password">
            <a href="#forgot">Forgot password?</a>
          </div>

          <button 
            type="submit" 
            className="get-started-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Get Started')}
          </button>

          <div className="auth-switch">
            <button 
              type="button" 
              className="auth-switch-btn"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError("");
              }}
            >
              {isSignUp 
                ? 'Already have an account? Sign in' 
                : 'No account? Create one'}
            </button>
          </div>

          <div className="social-divider">
            <span>Or sign in with</span>
          </div>

          <div className="social-buttons">
            <button type="button" className="social-btn google" disabled={isLoading}>
              <GoogleIcon />
            </button>
            <button type="button" className="social-btn facebook" disabled={isLoading}>
              <FacebookIcon />
            </button>
            <button type="button" className="social-btn apple" disabled={isLoading}>
              <AppleIcon />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
