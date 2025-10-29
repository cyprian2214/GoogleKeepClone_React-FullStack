import React from "react";
import LightbulbOutlineIcon from "@mui/icons-material/LightbulbOutline";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import EditIcon from "@mui/icons-material/Edit";
import ArchiveIcon from "@mui/icons-material/Archive";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

export default function Sidebar() {
  return (
    <div className="sidebar">
      <div className="sidebar-item active-item">
        <LightbulbOutlineIcon />
        <span className="sidebar-text">Notes</span>
      </div>
      <div className="sidebar-item">
        <NotificationsNoneIcon />
        <span className="sidebar-text">Reminders</span>
      </div>
      <div className="sidebar-item">
        <EditIcon />
        <span className="sidebar-text">Edit Labels</span>
      </div>
      <div className="sidebar-item">
        <ArchiveIcon />
        <span className="sidebar-text">Archive</span>
      </div>
      <div className="sidebar-item">
        <DeleteOutlineIcon />
        <span className="sidebar-text">Trash</span>
      </div>
    </div>
  );
}
