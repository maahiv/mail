import React, { useState } from "react";
import { Alert, Button, Card, Form } from "react-bootstrap";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "firebase/auth";
import { ref, push, set } from "firebase/database";

import { Editor } from "react-draft-wysiwyg";
import { EditorState, convertToRaw } from "draft-js";
import draftToHtml from "draftjs-to-html";

import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

import { auth, db } from "./firebase";

function App() {
  const [page, setPage] = useState("signup");
  const [loggedIn, setLoggedIn] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Mail states
  const [receiver, setReceiver] = useState("");
  const [subject, setSubject] = useState("");
  const [editorState, setEditorState] = useState(
    EditorState.createEmpty()
  );

  const [mailError, setMailError] = useState("");
  const [mailSuccess, setMailSuccess] = useState("");

  // ---------------- SIGNUP ----------------

  const handleSignup = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!email || !password || !confirmPassword) {
      setError("All fields are mandatory.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Password and Confirm Password do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    try {
      await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      console.log("User has successfully signed up");

      setSuccess("User has successfully signed up.");
      setLoginEmail(email);

      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      const messages = {
        "auth/email-already-in-use":
          "This email is already registered.",
        "auth/invalid-email":
          "Please enter a valid email address.",
        "auth/weak-password":
          "Password is too weak.",
        "auth/network-request-failed":
          "Network error. Please try again."
      };

      setError(
        messages[err.code] ||
          "Unable to sign up. Please try again."
      );
    }
  };

  // ---------------- LOGIN ----------------

  const handleLogin = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!loginEmail || !loginPassword) {
      setError("Email and password are required.");
      return;
    }

    try {
      const userCredential =
        await signInWithEmailAndPassword(
          auth,
          loginEmail,
          loginPassword
        );

      const token =
        await userCredential.user.getIdToken();

      localStorage.setItem("token", token);

      setLoggedIn(true);
    } catch (err) {
      setError("Invalid email or password.");
    }
  };

  // ---------------- SEND MAIL ----------------

  const handleSendMail = async (event) => {
    event.preventDefault();

    setMailError("");
    setMailSuccess("");

    const user = auth.currentUser;

    if (!user) {
      setMailError("Please login first.");
      return;
    }

    if (!receiver) {
      setMailError("Please enter receiver email.");
      return;
    }

    if (!subject) {
      setMailError("Please enter subject.");
      return;
    }

    const contentState = editorState.getCurrentContent();

    if (!contentState.hasText()) {
      setMailError("Please write a message.");
      return;
    }

    try {
      const messageHTML = draftToHtml(
        convertToRaw(contentState)
      );

      const newMailRef = push(ref(db, "emails"));

      await set(newMailRef, {
        sender: user.email,
        receiver: receiver.trim().toLowerCase(),
        subject: subject.trim(),
        body: messageHTML,
        createdAt: Date.now()
      });

      setMailSuccess("Mail sent successfully.");

      setReceiver("");
      setSubject("");
      setEditorState(EditorState.createEmpty());
    } catch (err) {
      console.error(err);
      setMailError(
        "Unable to send mail. Please try again."
      );
    }
  };

  // ---------------- NAVIGATION ----------------

  const goToLogin = () => {
    setPage("login");
    setError("");
    setSuccess("");
  };

  const goToSignup = () => {
    setPage("signup");
    setError("");
    setSuccess("");
  };

  // ---------------- COMPOSE MAIL ----------------

  if (loggedIn) {
    return (
      <div className="mail-page">

        <Card className="mail-compose">

          {/* TOP */}
          <div className="mail-top">

            <div className="to-section">
              <span className="to-label">To</span>

              <Form.Control
                type="email"
                className="to-input"
                placeholder="Receiver email"
                value={receiver}
                onChange={(e) =>
                  setReceiver(e.target.value)
                }
              />
            </div>

            <div className="mail-actions">
              <span>Cc</span>
              <span>Bcc</span>

              <Button
                variant="link"
                className="close-mail"
                onClick={() => {
                  setLoggedIn(false);
                  setPage("login");
                }}
              >
                ×
              </Button>
            </div>

          </div>

          {/* SUBJECT */}
          <Form.Control
            type="text"
            className="subject-input"
            placeholder="Subject"
            value={subject}
            onChange={(e) =>
              setSubject(e.target.value)
            }
          />

          {/* MESSAGE */}
          <div className="mail-editor">

            <Editor
              editorState={editorState}
              onEditorStateChange={setEditorState}
              toolbar={{
                options: [
                  "inline",
                  "colorPicker",
                  "emoji",
                  "link",
                  "history"
                ],
                inline: {
                  options: [
                    "bold",
                    "italic",
                    "underline"
                  ]
                },
                colorPicker: {
                  colors: [
                    "#000000",
                    "#ff0000",
                    "#0000ff",
                    "#008000",
                    "#ffff00",
                    "#ffa500",
                    "#800080",
                    "#00ffff"
                  ]
                }
              }}
              placeholder="Write your message..."
            />

          </div>

          {/* ALERTS */}
          {(mailError || mailSuccess) && (
            <div className="mail-message">

              {mailError && (
                <Alert variant="danger">
                  {mailError}
                </Alert>
              )}

              {mailSuccess && (
                <Alert variant="success">
                  {mailSuccess}
                </Alert>
              )}

            </div>
          )}

          {/* BOTTOM */}
          <div className="mail-bottom">

            <Button
              className="send-mail-button"
              onClick={handleSendMail}
            >
              Send
            </Button>

            <div className="bottom-icons">

              <span title="Attachment">📎</span>
              <span title="GIF">GIF</span>
              <span title="Image">▣</span>
              <span title="Emoji">☺</span>
              <span className="divider"></span>
              <span title="Link">🔗</span>
              <strong title="Bold">B</strong>
              <em title="Italic">I</em>
              <span title="Text color">A</span>
              <span title="More">•••</span>

            </div>

            <Button
              variant="link"
              className="delete-button"
              title="Delete draft"
              onClick={() => {
                setReceiver("");
                setSubject("");
                setEditorState(
                  EditorState.createEmpty()
                );
              }}
            >
              🗑
            </Button>

          </div>

        </Card>

      </div>
    );
  }

  // ---------------- LOGIN ----------------

  if (page === "login") {
    return (
      <div className="app">
        <main className="auth-area">

          <Card className="auth-card">
            <Card.Body>

              <h2 className="auth-title">
                Login
              </h2>

              {error && (
                <Alert
                  variant="danger"
                  className="message"
                >
                  {error}
                </Alert>
              )}

              <Form onSubmit={handleLogin}>

                <Form.Group className="mb-3">
                  <Form.Control
                    type="email"
                    placeholder="Email"
                    value={loginEmail}
                    onChange={(e) =>
                      setLoginEmail(e.target.value)
                    }
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-2">
                  <Form.Control
                    type="password"
                    placeholder="Password"
                    value={loginPassword}
                    onChange={(e) =>
                      setLoginPassword(e.target.value)
                    }
                    required
                  />
                </Form.Group>

                <Button
                  type="submit"
                  className="auth-button w-100"
                >
                  Login
                </Button>

              </Form>

              <Button
                variant="link"
                className="forgot-button"
                onClick={() =>
                  setError(
                    "Password reset is not implemented yet."
                  )
                }
              >
                Forgot password
              </Button>

            </Card.Body>
          </Card>

          <Button
            variant="outline-success"
            className="switch-button"
            onClick={goToSignup}
          >
            Don't have an account? Sign up
          </Button>

        </main>
      </div>
    );
  }

  // ---------------- SIGNUP ----------------

  return (
    <div className="app">
      <main className="auth-area">

        <Card className="auth-card">
          <Card.Body>

            <h2 className="auth-title">
              SignUp
            </h2>

            {error && (
              <Alert
                variant="danger"
                className="message"
              >
                {error}
              </Alert>
            )}

            {success && (
              <Alert
                variant="success"
                className="message"
              >
                {success}
              </Alert>
            )}

            <Form onSubmit={handleSignup}>

              <Form.Group className="mb-2">
                <Form.Control
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  required
                />
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Control
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Control
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
                  required
                />
              </Form.Group>

              <Button
                type="submit"
                className="auth-button w-100"
              >
                Sign up
              </Button>

            </Form>

          </Card.Body>
        </Card>

        <Button
          variant="outline-success"
          className="switch-button"
          onClick={goToLogin}
        >
          Have an account? Login
        </Button>

      </main>
    </div>
  );
}

export default App;