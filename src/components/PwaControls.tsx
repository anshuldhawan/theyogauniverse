"use client";

import { useEffect, useState } from "react";

function vapidKeyBytes(value: string): Uint8Array<ArrayBuffer> {
  const padded = value.padEnd(value.length + ((4 - (value.length % 4)) % 4), "=");
  const raw = atob(padded.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (character) => character.charCodeAt(0));
}

export function PwaBootstrap() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    void navigator.serviceWorker.register("/sw.js", { scope: "/" }).then((registration) => {
      if (/^\/booking\/|^\/dashboard\/bookings/.test(window.location.pathname)) {
        registration.active?.postMessage({ type: "CACHE_PRIVATE_URL", url: window.location.href });
      }
    });
  }, []);
  return null;
}

export function PushNotificationControl({ bookingReference }: { bookingReference: string }) {
  const [message, setMessage] = useState("");
  const publicKey = process.env.NEXT_PUBLIC_WEB_PUSH_VAPID_PUBLIC_KEY;

  async function subscribe() {
    if (!publicKey || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      setMessage("Push is unavailable here; booking updates will continue by email.");
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      setMessage("Push was not enabled; booking updates will continue by email.");
      return;
    }
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: vapidKeyBytes(publicKey),
    });
    const response = await fetch("/api/push/subscriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reference: bookingReference, subscription: subscription.toJSON() }),
    });
    setMessage(
      response.ok
        ? "Booking notifications enabled on this device."
        : "Push could not be enabled; booking updates will continue by email.",
    );
  }

  return (
    <div className="mt-5">
      <button type="button" className="link-back" onClick={() => void subscribe()}>
        Enable booking notifications
      </button>
      {message && <p className="mt-2 text-xs text-faint">{message}</p>}
    </div>
  );
}
