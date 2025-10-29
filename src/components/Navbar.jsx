import React from "react";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import ViewListIcon from "@mui/icons-material/ViewList";
import SettingsIcon from "@mui/icons-material/Settings";
import AppsIcon from "@mui/icons-material/Apps";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
export default function Navbar() {
  // previously the navbar opened an AuthModal; switch to a dedicated
  // /login page so auth UI is a separate route/page.

  return (
    <nav className="keep-nav">
      <div className="keep-logo-area">
        <MenuIcon className="keep-hover keep-icon" />
        <img
          src="https://www.gstatic.com/images/branding/product/1x/keep_2020q4_48dp.png"
          alt="Google Keep"
          style={{ width: 40, height: 40 }}
        />
        <span className="keep-logo-text">Keep</span>
      </div>

      <div className="keep-search-area">
        <SearchIcon className="keep-icon" />
        <input type="text" placeholder="Search your notes" />
      </div>

      <div className="keep-settings-area">
        <RefreshIcon className="keep-hover keep-icon" />
        <ViewListIcon className="keep-hover keep-icon" />
        <SettingsIcon className="keep-hover keep-icon" />
      </div>

      <div className="keep-profile-area">
        <AppsIcon className="keep-hover keep-icon" />
        <AccountCircleIcon 
          className="keep-hover keep-icon" 
          onClick={() => {
            window.location.href = "/login";
          }}
        />
      </div>
    </nav>
  );
}
