import React, { useEffect, useState } from "react";

import {
  ref,
  query,
  orderByChild,
  equalTo,
  get
} from "firebase/database";

import { signOut } from "firebase/auth";

import { auth, db } from "../../firebase";

import ComposeMail from "../ComposeMail/ComposeMail";

import "./Mailbox.css";

function Mailbox({ onLogout }) {
  const [activeTab, setActiveTab] = useState("inbox");

  const [inboxMails, setInboxMails] = useState([]);
  const [sentMails, setSentMails] = useState([]);

  const [selectedMail, setSelectedMail] = useState(null);

  const [showCompose, setShowCompose] = useState(false);

  const [loading, setLoading] = useState(false);

  const user = auth.currentUser;

  const fetchInbox = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const inboxQuery = query(
        ref(db, "emails"),
        orderByChild("receiver"),
        equalTo(user.email.toLowerCase())
      );

      const snapshot = await get(inboxQuery);

      const mails = [];

      if (snapshot.exists()) {
        snapshot.forEach((child) => {
          mails.push({
            id: child.key,
            ...child.val()
          });
        });
      }

      mails.sort(
        (a, b) => b.createdAt - a.createdAt
      );

      setInboxMails(mails);

    } catch (error) {
      console.error("Inbox error:", error);
    } finally {
      setLoading(false);
    }
  };

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

      mails.sort(
        (a, b) => b.createdAt - a.createdAt
      );

      setSentMails(mails);

    } catch (error) {
      console.error("Sent mail error:", error);
    }
  };

  useEffect(() => {
    fetchInbox();
    fetchSentMails();
  }, []);

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
      ? inboxMails
      : sentMails;

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
            📥 Inbox
            <span>{inboxMails.length}</span>
          </button>

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
            📤 Sent
            <span>{sentMails.length}</span>
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

        {selectedMail ? (

          <div className="open-mail">

            <button
              className="back-button"
              onClick={() => setSelectedMail(null)}
            >
              ← Back
            </button>

            <h2>
              {selectedMail.subject}
            </h2>

            <div className="mail-info">

              <p>
                <strong>From:</strong>{" "}
                {selectedMail.sender}
              </p>

              <p>
                <strong>To:</strong>{" "}
                {selectedMail.receiver}
              </p>

              <p>
                <strong>Date:</strong>{" "}
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

        ) : (

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
                  className="mail-item"
                  key={mail.id}
                  onClick={() =>
                    setSelectedMail(mail)
                  }
                >

                  <div className="mail-sender">

                    {activeTab === "inbox"
                      ? mail.sender
                      : mail.receiver}

                  </div>

                  <div className="mail-subject">
                    {mail.subject}
                  </div>

                  <div className="mail-date">
                    {new Date(
                      mail.createdAt
                    ).toLocaleDateString()}
                  </div>

                </div>

              ))

            )}

          </div>

        )}

      </main>

      {showCompose && (
       <ComposeMail
  onClose={() => setShowCompose(false)}
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