import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { LogInPage } from "./pages/LogInPage";
import { HomePage } from "./pages/HomePage";
import { ProfilePage } from "./pages/ProfilePage";
import { AboutPage } from "./pages/AboutPage";
import { SettingsPage } from "./pages/SettingsPage";
import { TextSelector } from "./components/TextSelector";
import "./App.css";

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  // Setting the default theme
  const preferredTheme = localStorage.getItem("preferred-theme");
  const preferredThemePair = localStorage.getItem("preferred-theme-pair");

  if (
    preferredThemePair !== "Dawn_n_Dusk" &&
    preferredThemePair !== "Cyber_Tech_01" &&
    preferredThemePair !== "Aesthetics_Unbound"
  ) {
    localStorage.setItem("preferred-theme-pair", "Dawn_n_Dusk");
  }
  if (preferredTheme !== "light" && preferredTheme !== "dark") {
    localStorage.setItem("preferred-theme", "light");
  }

  //
  // Setting the conversation bubbles
  const [chatHistory, setChatHistory] = useState<JSX.Element[]>([]);

  const addMessageToChatHistory = (newMessage: JSX.Element) => {
    setChatHistory((prevChatHistory) => [...prevChatHistory, newMessage]);
  };

  const clearChatHistory = () => {
    setChatHistory([]);
  };

  //
  // Check if Logged In otherwise redirect to login
  useEffect(() => {
    const handleServerResponse = (_, response) => {
      setIsLoggedIn(response["logged_in"]);
    };

    const serverResponseListener = (_, response) =>
      handleServerResponse(_, response);

    window.ipcRenderer.once("server-response", serverResponseListener);
    window.ipcRenderer.send("request-to-backend", {
      request_type: "check-user-login",
    });

    return () => {
      window.ipcRenderer.off("server-response", serverResponseListener);
    };
  }, []);

  //
  const changeLogInStatus = () => {
    setIsLoggedIn(true);
  };

  return (
    <>
    <TextSelector />
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            isLoggedIn ? (
              <HomePage
                chatHistory={chatHistory}
                addMessageToChatHistory={addMessageToChatHistory}
                clearChatHistory={clearChatHistory}
              />
            ) : (
              <LogInPage changeLogInStatus={changeLogInStatus} />
            )
          }
        />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </Router>
    </>
  );
};

export default App;
