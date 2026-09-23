import React, { useState } from "react";
import { Editor } from "react-draft-wysiwyg";
import {
  EditorState,
  convertToRaw
} from "draft-js";

import draftToHtml from "draftjs-to-html";

import { ref, push, set } from "firebase/database";
import { auth, db } from "../../firebase";

import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import "./ComposeMail.css";

function ComposeMail({ onClose, onMailSent }) {
  const [receiver, setReceiver] = useState("");
  const [subject, setSubject] = useState("");

  const [editorState, setEditorState] =
    useState(EditorState.createEmpty());

  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    setError("");

    const content = editorState.getCurrentContent();

    const plainText = content
      .getPlainText()
      .trim();

    if (!receiver.trim()) {
      setError("Receiver email is required.");
      return;
    }

    if (!subject.trim()) {
      setError("Subject is required.");
      return;
    }

    if (!plainText) {
      setError("Message is required.");
      return;
    }

    const user = auth.currentUser;

    if (!user) {
      setError("Please login again.");
      return;
    }

    try {
      setSending(true);

      const messageHTML = draftToHtml(
        convertToRaw(content)
      );

      const newMailRef = push(ref(db, "emails"));

      await set(newMailRef, {
  sender: user.email.toLowerCase(),
  receiver: receiver.trim().toLowerCase(),
  subject: subject.trim(),
  body: messageHTML,
  createdAt: Date.now(),
  read: false
});

      setReceiver("");
      setSubject("");
      setEditorState(EditorState.createEmpty());

      if (onMailSent) {
  await onMailSent();
}

onClose();

    } catch (error) {
      console.error(error);
      setError("Failed to send mail.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="compose-overlay">

      <div className="compose-box">

        <div className="compose-header">
          <h3>New Message</h3>

          <button
            className="compose-close"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="compose-body">

          <div className="compose-row">
            <input
              type="email"
              placeholder="To"
              value={receiver}
              onChange={(e) =>
                setReceiver(e.target.value)
              }
            />
          </div>

          <div className="compose-row">
            <input
              type="text"
              placeholder="Subject"
              value={subject}
              onChange={(e) =>
                setSubject(e.target.value)
              }
            />
          </div>

          <div className="compose-editor">

            <Editor
              editorState={editorState}
              onEditorStateChange={setEditorState}
              placeholder="Write your message..."
              toolbar={{
                options: [
                  "inline",
                  "blockType",
                  "fontSize",
                  "list",
                  "textAlign",
                  "colorPicker",
                  "link",
                  "emoji",
                  "history"
                ],
                inline: {
                  options: [
                    "bold",
                    "italic",
                    "underline",
                    "strikethrough"
                  ]
                }
              }}
            />

          </div>

          {error && (
            <div className="compose-error">
              {error}
            </div>
          )}

          <div className="compose-footer">

            <button
              className="send-button"
              onClick={handleSend}
              disabled={sending}
            >
              {sending ? "Sending..." : "Send"}
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default ComposeMail;