import { useEffect, useRef, useState } from "react";

export function TypewriterText({
  text,
  fallback,
  intervalMs = 30,
}: {
  text: string | null;
  fallback: string;
  intervalMs?: number;
}) {
  const [displayed, setDisplayed] = useState(text ?? fallback);
  const prevText = useRef(text);

  useEffect(() => {
    const wasEmpty = !prevText.current;
    prevText.current = text;

    if (!text || !wasEmpty) {
      setDisplayed(text ?? fallback);
      return;
    }

    let i = 0;
    setDisplayed("");
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, intervalMs);

    return () => clearInterval(id);
  }, [text, fallback]);

  return <>{displayed}</>;
}
