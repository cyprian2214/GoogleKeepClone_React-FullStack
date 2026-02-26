// Full updated app.js
const API_BASE = "https://googlekeepclone-api.onrender.com";
const AUTH_TOKEN_KEY = "authToken";

const getToken = () => localStorage.getItem(AUTH_TOKEN_KEY);

async function apiRequest(path, options = {}) {
  const token = getToken();
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    },
    ...options
  });

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      return;
    }
    let message = `Request failed: ${response.status}`;
    try {
      const data = await response.json();
      if (data && data.error) message = data.error;
    } catch (_) {
      // ignore JSON parse errors
    }
    throw new Error(message);
  }

  if (response.status === 204) return null;
  return response.json();
}

class App {
  constructor() {
    this.notes = [];
    this.selectedNoteId = "";
    this.miniSidebar = true;
    this.sidebarPinned = false;
    this.selectedSection = "notes";

    this.$activeForm = document.querySelector(".active-form");
    this.$inactiveForm = document.querySelector(".inactive-form");
    this.$noteTitle = document.querySelector("#note-title");
    this.$noteText = document.querySelector("#note-text");
    this.$notes = document.querySelector(".notes");
    this.$form = document.querySelector("#form");
    this.$modal = document.querySelector(".modal");
    this.$modalForm = document.querySelector("#modal-form");
    this.$modalTitle = document.querySelector("#modal-title");
    this.$modalText = document.querySelector("#modal-text");
    this.$closeModalForm = document.querySelector("#modal-btn");
    this.$sidebar = document.querySelector(".sidebar");
    this.$sidebarActiveItem = document.querySelector(".active-item");
    this.$accountIcon = document.querySelector("#account-icon");
    this.$accountMenu = document.querySelector("#account-menu");
    this.$accountActionButton = document.querySelector("#account-action-btn");

    this.addEventListeners();
    this.updateAccountAction();
    this.loadNotes();
  }

  addEventListeners() {
    document.body.addEventListener("click", (event) => {
      this.handleFormClick(event);
      void this.closeModal(event);
      this.openModal(event);
      void this.handleArchiving(event);
    });

    this.$form.addEventListener("submit", (event) => {
      event.preventDefault();
      const title = this.$noteTitle.value;
      const text = this.$noteText.value;
      void this.addNote({ title, text });
      this.closeActiveForm();
    });

    this.$modalForm.addEventListener("submit", (event) => {
      event.preventDefault();
    });

    document.querySelector("#menu-toggle").addEventListener("click", () => {
      this.toggleSidebar();
    });

    this.$sidebar.addEventListener("mouseover", () => {
      if (!this.sidebarPinned) this.expandSidebarTemporarily();
    });

    this.$sidebar.addEventListener("mouseout", () => {
      if (!this.sidebarPinned) this.collapseSidebarTemporarily();
    });

    document.querySelector(".search-area input").addEventListener("input", (e) => {
      const query = e.target.value.toLowerCase();
      const filtered = this.notes.filter(note => {
        const title = (note.title || "").toLowerCase();
        const text = (note.text || "").toLowerCase();
        return title.includes(query) || text.includes(query);
      });
      this.displayNotes(filtered);
    });

    document.querySelectorAll(".sidebar-item").forEach(item => {
      item.addEventListener("click", () => {
        const text = item.querySelector(".sidebar-text").textContent.trim();
        this.handleSidebarSelection(text);
      });
    });

    document.body.addEventListener("click", (e) => {
      const icon = e.target.closest(".material-symbols-outlined");
      if (!icon) return;

      const action = icon.innerText.trim();
      switch (action) {
        case "add_alert": alert("Reminder feature not ready."); break;
        case "person_add": alert("Collaborator coming soon."); break;
        case "palette": alert("Color change not implemented."); break;
        case "image": alert("Image upload coming soon."); break;
        case "more_vert": alert("More options coming."); break;
        case "undo": alert("Undo not ready."); break;
        case "redo": alert("Redo not ready."); break;
      }
    });

    const settingsIcon = document.getElementById("settings-icon");
    const settingsMenu = document.getElementById("settings-menu");
    const darkSwitch = document.getElementById("darkmode-switch");

    settingsIcon.addEventListener("click", (e) => {
      e.stopPropagation();
      settingsMenu.style.display =
        settingsMenu.style.display === "block" ? "none" : "block";
    });

    document.addEventListener("click", (e) => {
      if (!settingsMenu.contains(e.target) && e.target !== settingsIcon) {
        settingsMenu.style.display = "none";
      }
      if (this.$accountMenu && !this.$accountMenu.contains(e.target) && e.target !== this.$accountIcon) {
        this.$accountMenu.style.display = "none";
      }
    });

    darkSwitch.addEventListener("change", () => {
      if (darkSwitch.checked) {
        document.body.classList.add("dark-mode");
        localStorage.setItem("theme", "dark");
      } else {
        document.body.classList.remove("dark-mode");
        localStorage.setItem("theme", "light");
      }
    });

    if (localStorage.getItem("theme") === "dark") {
      document.body.classList.add("dark-mode");
      darkSwitch.checked = true;
    }

    if (this.$accountIcon) {
      this.$accountIcon.addEventListener("click", (event) => {
        event.stopPropagation();
        const current = this.$accountMenu.style.display;
        this.$accountMenu.style.display = current === "block" ? "none" : "block";
      });
    }

    if (this.$accountActionButton) {
      this.$accountActionButton.addEventListener("click", () => {
        if (this.isLoggedIn()) {
          localStorage.removeItem(AUTH_TOKEN_KEY);
        }
        window.location.href = "login.html";
      });
    }
  }

  isLoggedIn() {
    return Boolean(getToken());
  }

  updateAccountAction() {
    if (!this.$accountActionButton) return;
    this.$accountActionButton.textContent = this.isLoggedIn() ? "Logout" : "Login";
  }

  ensureAuthenticated(showMessage = false) {
    if (!this.isLoggedIn()) {
      if (showMessage) {
        alert("Log in from Accounts to save notes.");
      }
      return false;
    }
    return true;
  }

  toggleSidebar() {
    const main = document.querySelector("main");
    this.sidebarPinned = !this.sidebarPinned;

    if (this.sidebarPinned) {
      this.$sidebar.style.width = "250px";
      this.$sidebar.classList.add("sidebar-hover");
      this.$sidebarActiveItem.classList.add("sidebar-active-item");
      main.classList.add("sidebar-expanded");
    } else {
      this.$sidebar.style.width = "80px";
      this.$sidebar.classList.remove("sidebar-hover");
      this.$sidebarActiveItem.classList.remove("sidebar-active-item");
      main.classList.remove("sidebar-expanded");
    }
  }

  expandSidebarTemporarily() {
    const main = document.querySelector("main");
    this.$sidebar.style.width = "250px";
    this.$sidebar.classList.add("sidebar-hover");
    main.classList.add("sidebar-expanded");
  }

  collapseSidebarTemporarily() {
    const main = document.querySelector("main");
    this.$sidebar.style.width = "80px";
    this.$sidebar.classList.remove("sidebar-hover");
    main.classList.remove("sidebar-expanded");
  }

  handleSidebarSelection(section) {
    this.selectedSection = section.toLowerCase();
    this.render();
  }

  handleFormClick(event) {
    const isActiveFormClickedOn = this.$activeForm.contains(event.target);
    const isInactiveFormClickedOn = this.$inactiveForm.contains(event.target);
    const title = this.$noteTitle.value;
    const text = this.$noteText.value;

    if (isInactiveFormClickedOn) {
      this.openActiveForm();
    } else if (!isInactiveFormClickedOn && !isActiveFormClickedOn) {
      void this.addNote({ title, text });
      this.closeActiveForm();
    }
  }

  openActiveForm() {
    this.$inactiveForm.style.display = "none";
    this.$activeForm.style.display = "block";
    this.$noteText.focus();
  }

  closeActiveForm() {
    this.$inactiveForm.style.display = "block";
    this.$activeForm.style.display = "none";
    this.$noteText.value = "";
    this.$noteTitle.value = "";
  }

  openModal(event) {
    const $selectedNote = event.target.closest(".note");
    if ($selectedNote && !event.target.closest(".archive")) {
      this.selectedNoteId = $selectedNote.id;
      this.$modalTitle.value = $selectedNote.children[1].innerHTML;
      this.$modalText.value = $selectedNote.children[2].innerHTML;
      this.$modal.classList.add("open-modal");
    }
  }

  async closeModal(event) {
    const isModalFormClickedOn = this.$modalForm.contains(event.target);
    const isCloseModalBtnClickedOn = this.$closeModalForm.contains(event.target);
    if ((!isModalFormClickedOn || isCloseModalBtnClickedOn) && this.$modal.classList.contains("open-modal")) {
      await this.editNote(this.selectedNoteId, {
        title: this.$modalTitle.value,
        text: this.$modalText.value
      });
      this.$modal.classList.remove("open-modal");
    }
  }

  async handleArchiving(event) {
    if (!this.ensureAuthenticated(false)) return;
    const $selectedNote = event.target.closest(".note");
    if ($selectedNote && event.target.closest(".archive")) {
      const id = $selectedNote.id;
      const note = this.notes.find(n => n.id === id);
      if (!note) return;
      const updated = { archived: !note.archived };
      try {
        const saved = await apiRequest(`/api/notes/${id}`, {
          method: "PUT",
          body: JSON.stringify(updated)
        });
        if (!saved) return;
        this.notes = this.notes.map(n => (n.id === id ? this.toNote(saved) : n));
        this.render();
      } catch (error) {
        alert(error.message);
      }
    }
  }

  async addNote({ title, text }) {
    if (!this.ensureAuthenticated(true)) return;
    const trimmedText = (text || "").trim();
    const trimmedTitle = (title || "").trim();
    if (!trimmedText && !trimmedTitle) return;

    try {
      const created = await apiRequest("/api/notes", {
        method: "POST",
        body: JSON.stringify({
          title: trimmedTitle || null,
          content: trimmedText || null
        })
      });
      if (!created) return;
      this.notes = [this.toNote(created), ...this.notes];
      this.render();
    } catch (error) {
      alert(error.message);
    }
  }

  async editNote(id, { title, text }) {
    if (!this.ensureAuthenticated(false)) return;
    try {
      const updated = await apiRequest(`/api/notes/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          title: title ?? null,
          content: text ?? null
        })
      });
      if (!updated) return;
      this.notes = this.notes.map((note) => (note.id === id ? this.toNote(updated) : note));
      this.render();
    } catch (error) {
      alert(error.message);
    }
  }

  render() {
    this.displayNotes();
  }

  async loadNotes() {
    if (!this.isLoggedIn()) {
      this.notes = [];
      this.displayNotes();
      return;
    }
    try {
      const data = await apiRequest("/api/notes");
      if (!data) return;
      this.notes = data.map((note) => this.toNote(note));
      this.displayNotes();
    } catch (error) {
      alert(error.message);
    }
  }

  toNote(note) {
    return {
      id: note.id,
      title: note.title,
      text: note.content,
      archived: note.archived,
      pinned: note.pinned,
      color: note.color,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt
    };
  }

  displayNotes(filteredNotes = null) {
    let notesToRender = filteredNotes || this.notes;
    if (this.selectedSection === "notes") {
      notesToRender = notesToRender.filter((n) => !n.archived);
    } else if (this.selectedSection === "archive") {
      notesToRender = notesToRender.filter((n) => n.archived);
    }

    this.$notes.innerHTML = notesToRender
      .map(
        (note) => `
        <div class="note" id="${note.id}">
          <span class="material-symbols-outlined check-circle">check_circle</span>
          <div class="title">${note.title || ""}</div>
          <div class="text">${note.text || ""}</div>
          <div class="note-footer">
            <div class="tooltip"><span class="material-symbols-outlined hover small-icon">add_alert</span><span class="tooltip-text">Remind me</span></div>
            <div class="tooltip"><span class="material-symbols-outlined hover small-icon">person_add</span><span class="tooltip-text">Collaborator</span></div>
            <div class="tooltip"><span class="material-symbols-outlined hover small-icon">palette</span><span class="tooltip-text">Change Color</span></div>
            <div class="tooltip"><span class="material-symbols-outlined hover small-icon">image</span><span class="tooltip-text">Add Image</span></div>
            <div class="tooltip archive"><span class="material-symbols-outlined hover small-icon">archive</span><span class="tooltip-text">Archive</span></div>
            <div class="tooltip"><span class="material-symbols-outlined hover small-icon">more_vert</span><span class="tooltip-text">More</span></div>
          </div>
        </div>`
      )
      .join("");
  }
}

const app = new App();
