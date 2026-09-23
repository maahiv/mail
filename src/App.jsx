import React, { useState } from "react";
import { Alert, Button, Card, Container, Form, Navbar, Nav } from "react-bootstrap";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (event) => {
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
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      const messages = {
        "auth/email-already-in-use": "This email is already registered.",
        "auth/invalid-email": "Please enter a valid email address.",
        "auth/weak-password": "Password is too weak.",
        "auth/network-request-failed": "Network error. Please try again."
      };

      setError(messages[err.code] || "Unable to sign up. Please try again.");
    }
  };

  return (
    <div className="app">
      <Navbar className="top-navbar" expand="lg">
        <Container fluid className="px-2">
          <Navbar.Brand href="#" className="brand">
            <span className="brand-mark">✤</span>
            <span>MyWebLink</span>
          </Navbar.Brand>

          <Nav className="me-auto nav-links">
            <Nav.Link href="#">Home</Nav.Link>
            <Nav.Link href="#">Products</Nav.Link>
            <Nav.Link href="#">About Us</Nav.Link>
          </Nav>
        </Container>
      </Navbar>

      <div className="blue-shape" />

      <main className="signup-area">
        <Card className="signup-card">
          <Card.Body>
            <h2 className="signup-title">SignUp</h2>

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

            <Form onSubmit={handleSubmit}>
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

              <Button type="submit" className="signup-button w-100">
                Sign up
              </Button>
            </Form>
          </Card.Body>
        </Card>

        <Button variant="outline-success" className="login-button">
          Have an account? Login
        </Button>
      </main>
    </div>
  );
}

export default App;