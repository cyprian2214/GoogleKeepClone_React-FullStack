import React from "react";
import LoginPage from "./loginpage";

// resolve to the existing auth UI implemented in `loginpage.jsx`.
export default function AuthModal(props) {
  return <LoginPage {...props} />;
}
