import React, { useState, useEffect } from "react";
import "./style/TextSelector.css"

export const TextSelector: React.FC = () => {
  const [selectedText, setSelectedText] = useState<string>("");
  const [showOptions, setShowOptions] = useState<boolean>(false);
  const [position, setPosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  useEffect(() => {
    document.addEventListener("mouseup", handleTextSelection);
    return () => document.removeEventListener("mouseup", handleTextSelection);
  }, []);

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim() !== "") {
      setSelectedText(selection.toString());
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setPosition({ x: rect.left, y: rect.bottom });
      setShowOptions(true);
    } else {
      setShowOptions(false);
    }
  };

  const handleOptionClick = (option: string) => {
    console.log(`Option "${option}" clicked for text: ${selectedText}`);
    setShowOptions(false);
  };

  return (
    <>
      {showOptions && (
        <div
          style={{ position: "absolute", left: position.x, top: position.y }}
        >
          <button className="selection-btn" onClick={() => handleOptionClick("Option 1")}>
            Option 1
          </button>
          <button className="selection-btn" onClick={() => handleOptionClick("Option 2")}>
            Option 2
          </button>
        </div>
      )}
    </>
  );
};
