class NotesSection extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.notes = JSON.parse(localStorage.getItem("notes") || "[]");
    this.isAdding = false;
    this.newNoteContent = "";
    this.editingId = null;
    this.editContent = "";
  }

  connectedCallback() {
    this.render();
  }

  saveToStorage() {
    localStorage.setItem("notes", JSON.stringify(this.notes));
  }

  addNote() {
    if (!this.newNoteContent.trim()) return;
    const newNote = {
      id: Date.now().toString(),
      content: this.newNoteContent.trim(),
      created_at: new Date().toISOString(),
    };
    this.notes.push(newNote);
    this.newNoteContent = "";
    this.isAdding = false;
    this.saveToStorage();
    this.render();
  }

  deleteNote(id) {
    this.notes = this.notes.filter((n) => n.id !== id);
    this.saveToStorage();
    this.render();
  }

  startEdit(note) {
    this.editingId = note.id;
    this.editContent = note.content;
    this.render();
  }

  saveEdit(id) {
    if (!this.editContent.trim()) return;
    const note = this.notes.find((n) => n.id === id);
    if (note) note.content = this.editContent.trim();
    this.editingId = null;
    this.editContent = "";
    this.saveToStorage();
    this.render();
  }

  render() {
    const style = `
        <style>
          @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');

          :host {
            position: absolute;
            top: 2rem;
            right: 2rem;
            width: 20rem;
            font-family: system-ui, sans-serif;
            color: white;
          }
          h2 {
            color: rgba(255, 255, 255, 0.5);
            font-size: 0.8rem;
            font-weight: 300;
            letter-spacing: 0.05em;
            margin-bottom: 1rem;
          }
          button {
            background: none;
            border: none;
            cursor: pointer;
            color: rgba(255,255,255,0.5);
            transition: color 0.3s;
          }
          button:hover { color: white; }
          .note {
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 0.5rem;
            padding: 1rem;
            margin-bottom: 0.75rem;
            transition: all 0.3s;
          }
          .note:hover {
            background: rgba(255,255,255,0.08);
            border-color: rgba(255,255,255,0.2);
          }
          textarea {
            width: 100%;
            background: transparent;
            color: white;
            border: none;
            resize: none;
            font-size: 0.9rem;
            outline: none;
          }
          .actions {
            display: flex;
            justify-content: flex-end;
            gap: 0.5rem;
            margin-top: 0.5rem;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
          }
        </style>
      `;

    const addForm = this.isAdding
      ? `
          <div class="note">
            <textarea placeholder="Type your note...">${this.newNoteContent}</textarea>
            <div class="actions">
              <button id="cancelAdd">Cancel</button>
              <button id="saveAdd">Save</button>
            </div>
          </div>
        `
      : "";

    const notesHTML = this.notes
      .map((note) => {
        if (this.editingId === note.id) {
          return `
              <div class="note">
                <textarea>${this.editContent}</textarea>
                <div class="actions">
                  <button data-cancel="${note.id}"><i class="fa-solid fa-xmark"></i></button>
                  <button data-save="${note.id}"><i class="fa-solid fa-check"></i></button>
                </div>
              </div>
            `;
        }
        return `
            <div class="note">
              <p style="white-space: pre-wrap;">${note.content}</p>
              <div class="actions">
                <button data-edit="${note.id}"><i class="fa-solid fa-pen"></i></button>
                <button data-delete="${note.id}"><i class="fa-solid fa-trash"></i></button>
              </div>
            </div>
          `;
      })
      .join("");

    this.shadowRoot.innerHTML = `
        ${style}
        <div class="header">
          <h2>Quick Notes</h2>
          <button id="toggleAdd"><i class="fa-solid fa-plus"></i></button>
        </div>
        <div>
          ${addForm}
          ${notesHTML}
        </div>
      `;

    const shadow = this.shadowRoot;

    // Toggle add form
    shadow.getElementById("toggleAdd")?.addEventListener("click", () => {
      this.isAdding = !this.isAdding;
      this.render();
    });

    // Add note
    shadow.getElementById("cancelAdd")?.addEventListener("click", () => {
      this.isAdding = false;
      this.newNoteContent = "";
      this.render();
    });
    shadow.getElementById("saveAdd")?.addEventListener("click", () => {
      const textarea = shadow.querySelector("textarea");
      if (textarea) this.newNoteContent = textarea.value;
      this.addNote();
    });

    // Edit/Delete actions
    shadow
      .querySelectorAll("[data-delete]")
      .forEach((btn) =>
        btn.addEventListener("click", () =>
          this.deleteNote(btn.getAttribute("data-delete"))
        )
      );
    shadow.querySelectorAll("[data-edit]").forEach((btn) => {
      const note = this.notes.find(
        (n) => n.id === btn.getAttribute("data-edit")
      );
      if (note) btn.addEventListener("click", () => this.startEdit(note));
    });
    shadow.querySelectorAll("[data-save]").forEach((btn) => {
      const id = btn.getAttribute("data-save");
      btn.addEventListener("click", () => {
        const textarea = shadow.querySelector("textarea");
        if (textarea) this.editContent = textarea.value;
        this.saveEdit(id);
      });
    });
    shadow.querySelectorAll("[data-cancel]").forEach((btn) =>
      btn.addEventListener("click", () => {
        this.editingId = null;
        this.editContent = "";
        this.render();
      })
    );

    // Handle typing in textarea
    shadow.querySelectorAll("textarea").forEach((ta) => {
      ta.addEventListener("input", (e) => {
        if (this.isAdding) this.newNoteContent = e.target.value;
        if (this.editingId) this.editContent = e.target.value;
      });
    });
  }
}

customElements.define("notes-section", NotesSection);
