import React from "react";
import LoginPage from "./loginpage";

// Lightweight wrapper so imports of `./AuthModal` (used by Navbar.jsx)
// resolve to the existing auth UI implemented in `loginpage.jsx`.
export default function AuthModal(props) {
  return <LoginPage {...props} />;
}
