import React from "react";
import LoginPage from "./components/loginpage";

// Route wrapper for the standalone login page.
// It reuses the existing `loginpage.jsx` component and
// provides `show` and `onClose` props suitable for a full page.
export default function LoginRoute() {
  return (
    <LoginPage
      show={true}
      onClose={() => {
        // return to home page after successful sign-in or when user closes
        window.location.href = "/";
      }}
    />
  );
}
