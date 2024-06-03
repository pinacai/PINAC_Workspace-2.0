import "./style/HomePage.css";
import React, { useState, useEffect, useRef } from "react";
import { Sidebar } from "../components/Sidebar";
import { Header } from "../components/Header";
import {
  HumanMessage,
  AiMessage,
  EmailMessage,
  ScheduleMessage,
} from "../components/MessageViewer";

// Icons
import sendIcon from "../assets/icon/send.svg";

export const HomePage: React.FC = () => {
  const [welcomeBox, setWelcomeBox] = useState<JSX.Element>(
    <div className="welcome-text-row">
      <div className="welcome-text">
        Hello,
        <br />
        How can I help you today ?
      </div>
    </div>
  );
  const [messages, setMessages] = useState<JSX.Element[]>([]); // For showing conversation bubbles
  const [userInput, setUserInput] = useState<string>(); // Declare state for input value
  const [isUserInputActive, setUserInputActive] = useState<boolean>(false); // Declare state for input value
  const [buttonsDisabled, setButtonsDisabled] = useState<boolean>(false); // For disabling send button
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Handles changes in user input
  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserInput(event.target.value);
  };

  // Handles Enter key press for submitting messages
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && userInput !== undefined) {
      event.preventDefault(); // Prevent default Enter behavior
      submit(userInput);
    }
  };

  const clearChat = () => {
    setMessages([]);
    window.ipcRenderer.send("client-request", ["clear-history"]);
    setWelcomeBox(
      <div className="welcome-text-row">
        <div className="welcome-text">
          Hello,
          <br />
          How can I help you today ?
        </div>
      </div>
    );
  };

  // Actions after clicking send button or pressing Enter
  const submit = (text: string) => {
    setButtonsDisabled(true);
    if (welcomeBox !== <></>) {
      setWelcomeBox(<></>);
    }
    setMessages((prevMessages) => [
      ...prevMessages,
      <HumanMessage
        key={`human-message-${prevMessages.length}`}
        response={text}
      />,
    ]);
    fetchAIResponse(text);
    setUserInput("");
    setButtonsDisabled(false);
  };

  const fetchAIResponse = async (userInput: string) => {
    let aiMessage: JSX.Element;
    // Sends user input to main.ts (main.ts to server(python)) for AI processing
    const preferredModel = localStorage.getItem("preferred-model");
    window.ipcRenderer.send("client-request", [
      "user-input",
      preferredModel,
      userInput,
    ]);
    // Listen for a single response from the main process
    window.ipcRenderer.once("server-response", (_, response) => {
      // Check if the response is an email
      if (response[0] === "email") {
        const aiText = "Here is your email, check it out:";
        const subject = response[1];
        const body = response[2];
        // Display email message
        aiMessage = (
          <EmailMessage response={aiText} subject={subject} body={body} />
        );
      } else if (response[0] === "schedule") {
        aiMessage = <ScheduleMessage schedule={response[1]} />;
      } else {
        // Display standard AI message
        aiMessage = <AiMessage response={response[1]} />;
      }
      // Update the state to include the new AI message
      setMessages((prevMessages) => [...prevMessages, aiMessage]);
    });
  };

  useEffect(() => {
    const handleKeyup = (e: KeyboardEvent) => {
      const scHeight = (e.target as HTMLTextAreaElement).scrollHeight;
      (e.target as HTMLTextAreaElement).style.height = "50px";
      textareaRef.current!.style.height = `${scHeight}px`;

      if ((e.target as HTMLTextAreaElement).value.trim() === "") {
        // Set the textarea height back to the default
        textareaRef.current!.style.height = "50px";
      }
    };

    const textareaElement = textareaRef.current;
    if (textareaElement) {
      textareaElement.addEventListener("keyup", handleKeyup);
    }

    return () => {
      if (textareaElement) {
        textareaElement.removeEventListener("keyup", handleKeyup);
      }
    };
  }, []);

  // Updates the body's classList with the selected
  // For smooth applying of current theme
  useEffect(() => {
    const body = document.body;
    const preferredTheme = localStorage.getItem("preferred-theme");
    const preferredThemePair = localStorage.getItem("preferred-theme-pair");
    // Remove all theme classes first
    body.classList.remove(
      "Dawn_n_Dusk-light",
      "Dawn_n_Dusk-dark",
      "Cyber_Tech_01-light",
      "Cyber_Tech_01-dark"
    );
    // Add desired theme pair with 'light-theme' or 'dark-theme' as user previous preference
    body.classList.add(`${preferredThemePair}-${preferredTheme}`);
  });

  return (
    <>
      <Sidebar />
      <div className="container">
        <Header title="PINAC" clearChat={clearChat} />
        <div className="chat-container">
          <div className="msg-box">
            {welcomeBox}
            {messages}
          </div>

          <div className="input-box">
            <div
              className={`input-group ${isUserInputActive ? "active" : ""}`}
              onFocus={() => setUserInputActive(true)}
              onBlur={() => setUserInputActive(false)}
            >
              <textarea
                id="user-input"
                className={buttonsDisabled ? "disabled" : ""}
                value={userInput}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder="Tell me your task..."
                disabled={buttonsDisabled}
                ref={textareaRef}
                required
              />
              <div className="input-group-append">
                <button
                  id="submit-btn"
                  className={buttonsDisabled ? "disabled" : ""}
                  onClick={() =>
                    userInput !== undefined ? submit(userInput) : {}
                  }
                  disabled={buttonsDisabled}
                >
                  <img
                    src={sendIcon}
                    alt="Submit"
                    className="submit-icon changeable-icon"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};