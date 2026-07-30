"use client";

import { useState } from "react";

export function ShareButton({ title, text }: { title: string; text?: string }) {
  const [message, setMessage] = useState("");

  async function share() {
    const data = { title, text, url: window.location.href };
    try {
      if (navigator.share) {
        await navigator.share(data);
        setMessage("Shared.");
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setMessage("Link copied.");
      }
    } catch (error) {
      if ((error as DOMException).name !== "AbortError") setMessage("Copy this page URL to share it.");
    }
  }

  return (
    <span>
      <button type="button" className="link-back" onClick={() => void share()}>
        Share
      </button>
      <span className="ml-2 text-xs text-faint" aria-live="polite">
        {message}
      </span>
    </span>
  );
}
