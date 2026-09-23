import React, { useState } from "react";
import { Alert, Button, Card, Form } from "react-bootstrap";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "firebase/auth";
import { auth } from "./firebase";

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
      await createUserWithEmailAndPassword(auth, email, password);

      console.log("User has successfully signed up");
      setSuccess("User has successfully signed up.");

      setLoginEmail(email);
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      const messages = {
        "auth/email-already-in-use": "This email is already registered.",
        "auth/invalid-email": "Please enter a valid email address.",
        "auth/weak-password": "Password is too weak.",
        "auth/network-request-failed":
          "Network error. Please try again."
      };

      setError(messages[err.code] || "Unable to sign up. Please try again.");
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!loginEmail || !loginPassword) {
      setError("Email and password are required.");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        loginEmail,
        loginPassword
      );

      const token = await userCredential.user.getIdToken();

      localStorage.setItem("token", token);

      setLoggedIn(true);
    } catch (err) {
      setError("Invalid email or password.");
    }
  };

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

  if (loggedIn) {
    return (
      <div className="welcome-screen">
        <h2>Welcome to your mail box</h2>
      </div>
    );
  }

  if (page === "login") {
    return (
      <div className="app">
        <main className="auth-area">
          <Card className="auth-card">
            <Card.Body>
              <h2 className="auth-title">Login</h2>

              {error && (
                <Alert variant="danger" className="message">
                  {error}
                </Alert>
              )}

              <Form onSubmit={handleLogin}>
                <Form.Group className="mb-3">
                  <Form.Control
                    type="email"
                    placeholder="Email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-2">
                  <Form.Control
                    type="password"
                    placeholder="Password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </Form.Group>

                <Button type="submit" className="auth-button w-100">
                  Login
                </Button>
              </Form>

              <Button
                variant="link"
                className="forgot-button"
                onClick={() => setError("Password reset is not implemented yet.")}
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

  return (
    <div className="app">
      <main className="auth-area">
        <Card className="auth-card">
          <Card.Body>
            <h2 className="auth-title">SignUp</h2>

            {error && (
              <Alert variant="danger" className="message">
                {error}
              </Alert>
            )}

            {success && (
              <Alert variant="success" className="message">
                {success}
              </Alert>
            )}

            <Form onSubmit={handleSignup}>
              <Form.Group className="mb-2">
                <Form.Control
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Control
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Control
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </Form.Group>

              <Button type="submit" className="auth-button w-100">
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
