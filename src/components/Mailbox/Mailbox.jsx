import React, {
  useEffect,
  useReducer,
  useState
} from "react";

import {
  ref,
  query,
  orderByChild,
  equalTo,
  get,
  update,
  remove
} from "firebase/database";

import { signOut, onAuthStateChanged } from "firebase/auth";

import { auth, db } from "../../firebase";
import ComposeMail from "../ComposeMail/ComposeMail";

import "./Mailbox.css";

const initialState = {
  inbox: [],
  sent: []
};

function mailReducer(state, action) {
  switch (action.type) {
    case "SET_INBOX":
      return {
        ...state,
        inbox: action.payload
      };

    case "SET_SENT":
      return {
        ...state,
        sent: action.payload
      };

    case "MARK_AS_READ":
      return {
        ...state,
        inbox: state.inbox.map((mail) =>
          mail.id === action.payload
            ? { ...mail, read: true }
            : mail
        )
      };

    case "DELETE_MAIL":
      return {
        ...state,
        inbox: state.inbox.filter(
          (mail) => mail.id !== action.payload
        ),
        sent: state.sent.filter(
          (mail) => mail.id !== action.payload
        )
      };

    default:
      return state;
  }
}

function Mailbox({ onLogout }) {
  const [state, dispatch] = useReducer(
    mailReducer,
    initialState
  );

  const [activeTab, setActiveTab] = useState("inbox");
  const [selectedMail, setSelectedMail] = useState(null);
  const [showCompose, setShowCompose] = useState(false);
  const [loading, setLoading] = useState(false);

  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  // Fetch Inbox
  const fetchInbox = async (showLoading = false) => {
    if (!user) return;

    try {
      if (showLoading) { setLoading(true); }

      const inboxQuery = query(
        ref(db, "emails"),
        orderByChild("receiver"),
        equalTo(user.email.toLowerCase())
      );

      const snapshot = await get(inboxQuery);
      const mails = [];

      if (snapshot.exists()) {
        snapshot.forEach((child) => {
          const data = child.val();

          mails.push({
            id: child.key,
            ...data,
            read: data.read === true
          });
        });
      }

      mails.sort((a, b) => b.createdAt - a.createdAt);

      dispatch({
        type: "SET_INBOX",
        payload: mails
      });
    } catch (error) {
      console.error("Inbox error:", error);
    } finally {
      if (showLoading) { setLoading(false); }
    }
  };

  // Fetch Sent Mails
  const fetchSentMails = async () => {
    if (!user) return;

    try {
      const sentQuery = query(
        ref(db, "emails"),
        orderByChild("sender"),
        equalTo(user.email.toLowerCase())
      );

      const snapshot = await get(sentQuery);
      const mails = [];

      if (snapshot.exists()) {
        snapshot.forEach((child) => {
          mails.push({
            id: child.key,
            ...child.val()
          });
        });
      }

      mails.sort((a, b) => b.createdAt - a.createdAt);

      dispatch({
        type: "SET_SENT",
        payload: mails
      });
    } catch (error) {
      console.error("Sent mail error:", error);
    }
  };

  useEffect(() => {
    if (!user) return;

    fetchInbox(true);
    fetchSentMails();

    const interval = setInterval(() => {
      fetchInbox(false);
      fetchSentMails();
    }, 2000);

    return () => clearInterval(interval);
  }, [user]);

  // Open Mail
  const handleOpenMail = async (mail) => {
    setSelectedMail(mail);

    // Only inbox mails need read status
    if (
      activeTab === "inbox" &&
      mail.read === false
    ) {
      try {
        await update(
          ref(db, `emails/${mail.id}`),
          {
            read: true
          }
        );

        dispatch({
          type: "MARK_AS_READ",
          payload: mail.id
        });

        setSelectedMail({
          ...mail,
          read: true
        });
      } catch (error) {
        console.error(
          "Error marking mail as read:",
          error
        );
      }
    }
  };

  // Delete Mail
  const handleDeleteMail = async (mailId) => {
    try {
      await remove(
        ref(db, `emails/${mailId}`)
      );

      dispatch({
        type: "DELETE_MAIL",
        payload: mailId
      });

      setSelectedMail(null);
    } catch (error) {
      console.error(
        "Error deleting mail:",
        error
      );
    }
  };

  // Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("token");
      onLogout();
    } catch (error) {
      console.error(error);
    }
  };

  const currentMails =
    activeTab === "inbox"
      ? state.inbox
      : state.sent;

  const unreadCount = state.inbox.filter(
    (mail) => mail.read === false
  ).length;

  return (
    <div className="mailbox-page">

      {/* Sidebar */}
      <aside className="mail-sidebar">

        <h2 className="mail-logo">
          Mailbox
        </h2>

        <button
          className="compose-main-button"
          onClick={() => setShowCompose(true)}
        >
          + Compose
        </button>

        <div className="mail-nav">

          {/* Inbox */}
          <button
            className={
              activeTab === "inbox"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() => {
              setActiveTab("inbox");
              setSelectedMail(null);
            }}
          >
            <span>📥 Inbox</span>

            {unreadCount > 0 && (
              <span className="unread-count">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Sent */}
          <button
            className={
              activeTab === "sent"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() => {
              setActiveTab("sent");
              setSelectedMail(null);
            }}
          >
            <span>📤 Sent</span>
          </button>

        </div>

        <button
          className="logout-button"
          onClick={handleLogout}
        >
          Logout
        </button>

      </aside>

      {/* Main */}
      <main className="mail-main">

        <div className="mail-topbar">

          <div>
            <h2>
              {activeTab === "inbox"
                ? "Inbox"
                : "Sent"}
            </h2>

            <p>{user?.email}</p>
          </div>

          <button
            className="top-compose-button"
            onClick={() => setShowCompose(true)}
          >
            Compose
          </button>

        </div>

        {/* Read Mail */}
        {selectedMail ? (

          <div className="open-mail">

            <button
              className="back-button"
              onClick={() =>
                setSelectedMail(null)
              }
            >
              ← Back
            </button>

            <h2>
              {selectedMail.subject}
            </h2>

            <div className="opened-mail-box">

              <div className="opened-mail-header">

                <div>
                  <p>
                    <strong>From:</strong>{" "}
                    {selectedMail.sender}
                  </p>

                  <p>
                    <strong>To:</strong>{" "}
                    {selectedMail.receiver}
                  </p>
                </div>

                <p className="opened-mail-date">
                  {new Date(
                    selectedMail.createdAt
                  ).toLocaleString()}
                </p>

              </div>

              <hr />

              <div
                className="mail-content"
                dangerouslySetInnerHTML={{
                  __html: selectedMail.body
                }}
              />

            </div>

          </div>

        ) : (

          /* Inbox / Sent List */
          <div className="mail-list">

            {loading ? (

              <div className="empty-mail">
                Loading mails...
              </div>

            ) : currentMails.length === 0 ? (

              <div className="empty-mail">
                No mails found.
              </div>

            ) : (

              currentMails.map((mail) => (

                <div
                  className={
                    activeTab === "inbox" &&
                    mail.read === false
                      ? "mail-item unread-mail"
                      : "mail-item read-mail"
                  }
                  key={mail.id}
                  onClick={() =>
                    handleOpenMail(mail)
                  }
                >

                  {/* Blue Dot */}
                  <div className="mail-dot-area">
                    {activeTab === "inbox" &&
                      mail.read === false && (
                        <span className="blue-dot"></span>
                      )}
                  </div>

                  {/* Sender / Receiver */}
                  <div className="mail-sender">
                    {activeTab === "inbox"
                      ? mail.sender
                      : mail.receiver}
                  </div>

                  {/* Subject */}
                  <div className="mail-preview">
                    <span className="mail-subject">
                      {mail.subject}
                    </span>
                  </div>

                  {/* Date */}
                  <div className="mail-date">
                    {new Date(
                      mail.createdAt
                    ).toLocaleDateString()}
                  </div>

                  {/* Delete */}
                  <button
                    className="delete-mail-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteMail(mail.id);
                    }}
                  >
                    Delete
                  </button>

                </div>

              ))

            )}

          </div>

        )}

      </main>

      {/* Compose */}
      {showCompose && (
        <ComposeMail
          onClose={() =>
            setShowCompose(false)
          }
          onMailSent={async () => {
            await fetchInbox();
            await fetchSentMails();

            setActiveTab("sent");
            setSelectedMail(null);
          }}
        />
      )}

    </div>
  );
}

export default Mailbox;