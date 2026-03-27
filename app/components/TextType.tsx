"use client";

import { useState, useEffect } from "react";

interface TextTypeProps {
  text?: string[];
  texts?: string[];
  typingSpeed?: number;
  pauseDuration?: number;
  showCursor?: boolean;
  cursorCharacter?: string;
  deletingSpeed?: number;
  variableSpeedEnabled?: boolean;
  variableSpeedMin?: number;
  variableSpeedMax?: number;
  cursorBlinkDuration?: number;
  className?: string;
}

export default function TextType({
  text,
  texts,
  typingSpeed = 75,
  pauseDuration = 1500,
  showCursor = true,
  cursorCharacter = "_",
  deletingSpeed = 50,
  className = "",
}: TextTypeProps) {
  const words = texts || text || [""];
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const currentString = words[currentWordIndex];

    if (!isDeleting && currentText === currentString) {
      if (words.length > 1) {
        timeout = setTimeout(() => setIsDeleting(true), pauseDuration);
      }
    } else if (isDeleting && currentText === "") {
      setIsDeleting(false);
      setCurrentWordIndex((prev) => (prev + 1) % words.length);
    } else {
      timeout = setTimeout(
        () => {
          setCurrentText((prev) =>
            isDeleting
              ? currentString.substring(0, prev.length - 1)
              : currentString.substring(0, prev.length + 1)
          );
        },
        isDeleting ? deletingSpeed : typingSpeed
      );
    }

    return () => clearTimeout(timeout);
  }, [
    currentText,
    isDeleting,
    currentWordIndex,
    words,
    typingSpeed,
    deletingSpeed,
    pauseDuration,
  ]);

  return (
    <h2 className={className}>
      {currentText}
      {showCursor && (
        <span className="animate-pulse">{cursorCharacter}</span>
      )}
    </h2>
  );
}
