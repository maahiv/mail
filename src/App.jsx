import React, { useState } from "react";

import Auth from "./components/Auth/Auth";
import Mailbox from "./components/Mailbox/Mailbox";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  if (!loggedIn) {
    return (
      <Auth
        onLogin={() => setLoggedIn(true)}
      />
    );
  }

  return (
    <Mailbox
      onLogout={() => setLoggedIn(false)}
    />
  );
}

export default App;