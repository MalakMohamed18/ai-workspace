import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUp,
  ChevronDown,
  FileText,
  FolderOpen,
  Menu,
  Paperclip,
  Plus,
  Search,
  Settings2,
  Sparkles,
  X,
} from "lucide-react";

// Placeholder API until backend service is created
const api = {
  getChats: async () => ({
    data: [
      { id: 1, title: "Initial Project", preview: "Workspace set up", group: "Today" },
    ],
  }),
  createChat: async (title) => ({
    data: { id: Date.now(), title, preview: "New chat created", group: "Today" },
  }),
  sendMessage: async (chatId, text) => ({
    data: { id: Date.now(), text, files: [] },
  }),
};

function App() {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(1);
  const [message, setMessage] = useState("");
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sentMessages, setSentMessages] = useState([]);

  const fileInput = useRef(null);

  useEffect(() => {
    loadChats();
  }, []);

  async function loadChats() {
    try {
      const response = await api.getChats();
      setChats(response.data);
    } catch (error) {
      console.error(error);
    }
  }

  const active = useMemo(
    () => chats.find((chat) => chat.id === activeChat) ?? chats[0],
    [chats, activeChat]
  );

  const createChat = async () => {
    try {
      const response = await api.createChat("New workspace");
      const newChat = response.data;

      setChats((prev) => [newChat, ...prev]);
      setActiveChat(newChat.id);
      setSentMessages([]);
      setAttachedFiles([]);
    } catch (error) {
      console.error(error);
    }
  };

  const selectChat = (id) => {
    setActiveChat(id);
    setSentMessages([]);
    setAttachedFiles([]);
  };

  const handleFiles = (event) => {
    const files = Array.from(event.target.files || []);
    setAttachedFiles((prev) => [...prev, ...files]);
    event.target.value = "";
  };

  const removeFile = (name) => {
    setAttachedFiles((prev) =>
      prev.filter((file) => file.name !== name)
    );
  };

  const sendMessage = async () => {
    const trimmed = message.trim();
    if (!trimmed && attachedFiles.length === 0) return;

    try {
      const response = await api.sendMessage(activeChat, trimmed);
      const newMessage = {
        ...response.data,
        files: attachedFiles.map((f) => f.name),
      };

      setSentMessages((prev) => [...prev, newMessage]);
      setMessage("");
      setAttachedFiles([]);
    } catch (error) {
      console.error(error);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const groupedChats = {
    Today: chats.filter((chat) => chat.group === "Today"),
    Yesterday: chats.filter((chat) => chat.group === "Yesterday"),
  };

  return (
    <div className="app-shell">
      {/* SIDEBAR */}
      <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="brand-row">
          <div className="brand-mark">
            <Sparkles size={17} />
          </div>

          {sidebarOpen && <span className="brand-name">Workspace</span>}

          {sidebarOpen && (
            <button
              className="icon-button ghost"
              onClick={() => setSidebarOpen(false)}
            >
              <Menu size={19} />
            </button>
          )}
        </div>

        {sidebarOpen && (
          <>
            <button className="new-chat" onClick={createChat}>
              <Plus size={18} />
              <span>New conversation</span>
              <span className="shortcut">N</span>
            </button>

            <div className="sidebar-search">
              <Search size={16} />
              <input placeholder="Search history" />
              <span className="shortcut">⌘K</span>
            </div>

            <div className="history">
              {Object.entries(groupedChats).map(([group, items]) => (
                <section className="history-group" key={group}>
                  <div className="group-title">{group}</div>
                  {items.map((chat) => (
                    <button
                      className={`history-item ${
                        chat.id === activeChat ? "active" : ""
                      }`}
                      key={chat.id}
                      onClick={() => selectChat(chat.id)}
                    >
                      <div className="history-icon">
                        <FileText size={15} />
                      </div>
                      <div className="history-copy">
                        <strong>{chat.title}</strong>
                        <span>{chat.preview}</span>
                      </div>
                    </button>
                  ))}
                </section>
              ))}
            </div>

            <div className="sidebar-bottom">
              <button className="bottom-item">
                <FolderOpen size={17} />
                <span>Files</span>
              </button>
              <button className="bottom-item">
                <Settings2 size={17} />
                <span>Settings</span>
              </button>
            </div>
          </>
        )}

        {!sidebarOpen && (
          <button
            className="icon-button collapsed-menu"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={19} />
          </button>
        )}
      </aside>

      {/* MAIN */}
      <main className="main">
        <header className="topbar">
          <div className="mobile-menu">
            <button
              className="icon-button ghost"
              onClick={() => setSidebarOpen((value) => !value)}
            >
              <Menu size={20} />
            </button>
          </div>

          <div>
            <div className="eyebrow">Conversation</div>
            <h1>{active?.title || "New Workspace"}</h1>
          </div>

          <button className="model-select">
            Workspace model
            <ChevronDown size={15} />
          </button>
        </header>

        {/* CONVERSATION AREA */}
        <div className="conversation">
          {sentMessages.length === 0 ? (
            <div className="welcome">
              <div className="welcome-icon">
                <Sparkles size={22} />
              </div>
              <p className="welcome-label">Workspace</p>
              <h2>What are we working on?</h2>
              <p className="welcome-copy">
                Write an idea, ask a question, or attach a file. Your
                conversation will stay organized here.
              </p>

              <div className="starter-grid">
                <button
                  onClick={() =>
                    setMessage(
                      "Help me plan the architecture of my web app"
                    )
                  }
                >
                  <span>Plan a project</span>
                  <small>Turn an idea into a clear structure</small>
                </button>

                <button
                  onClick={() => setMessage("Summarize the attached file")}
                >
                  <span>Work with a file</span>
                  <small>Upload notes, documents, or references</small>
                </button>
              </div>
            </div>
          ) : (
            <div className="messages">
              {sentMessages.map((item) => (
                <div className="message-row" key={item.id}>
                  <div className="avatar user-avatar">M</div>
                  <div className="message-body">
                    {item.files?.length > 0 && (
                      <div className="message-files">
                        {item.files.map((file) => (
                          <div className="message-file" key={file}>
                            <FileText size={14} />
                            <span>{file}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {item.text && <p>{item.text}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* COMPOSER */}
        <div className="composer-area">
          <div className="composer">
            {attachedFiles.length > 0 && (
              <div className="attachment-row">
                {attachedFiles.map((file) => (
                  <div className="attachment" key={file.name}>
                    <FileText size={14} />
                    <span>{file.name}</span>
                    <button onClick={() => removeFile(file.name)}>
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Write something..."
              rows={2}
            />

            <div className="composer-footer">
              <div className="composer-actions">
                <input
                  ref={fileInput}
                  type="file"
                  multiple
                  hidden
                  onChange={handleFiles}
                />
                <button
                  className="composer-tool"
                  onClick={() => fileInput.current?.click()}
                >
                  <Paperclip size={17} />
                  <span>Attach</span>
                </button>
              </div>

              <div className="composer-hint">
                Enter to send · Shift + Enter for a new line
              </div>

              <button
                className={`send-button ${
                  message.trim() || attachedFiles.length ? "ready" : ""
                }`}
                onClick={sendMessage}
              >
                <ArrowUp size={18} />
              </button>
            </div>
          </div>

          <p className="composer-note">
            Phase 1 is UI-only. AI, authentication, database, and real file
            processing come in the next phases.
          </p>
        </div>
      </main>
    </div>
  );
}

export default App;