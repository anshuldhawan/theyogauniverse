"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { checkInAction } from "@/app/actions/dashboard";
import { Button } from "@/components/ui";

export function CheckInForm() {
  const [state, formAction, pending] = useActionState(checkInAction, { message: "" });
  const [reference, setReference] = useState("");
  const [scanning, setScanning] = useState(false);
  const [cameraMessage, setCameraMessage] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<{ stop(): void; destroy(): void } | null>(null);

  useEffect(() => () => scannerRef.current?.destroy(), []);

  async function startScanner() {
    if (!videoRef.current) return;
    setCameraMessage("");
    try {
      const { default: QrScanner } = await import("qr-scanner");
      const scanner = new QrScanner(
        videoRef.current,
        (result) => {
          const value = result.data.trim().toUpperCase();
          const match = /SH-[A-Z0-9]{6}/.exec(value);
          if (!match) {
            setCameraMessage("That QR code is not a booking check-in code.");
            return;
          }
          setReference(match[0]);
          scanner.stop();
          setScanning(false);
          setCameraMessage("Code scanned. Confirm the attendance status below.");
        },
        { preferredCamera: "environment", returnDetailedScanResult: true },
      );
      scannerRef.current = scanner;
      await scanner.start();
      setScanning(true);
    } catch {
      setScanning(false);
      setCameraMessage("Camera access is unavailable. Enter the booking reference manually.");
    }
  }

  return (
    <form action={formAction} className="mt-4 flex flex-wrap items-end gap-3">
      <div className="w-full">
        <button type="button" className="link-back" onClick={() => void startScanner()}>
          {scanning ? "Scanning…" : "Scan booking QR"}
        </button>
        <video
          ref={videoRef}
          className={scanning ? "mt-3 aspect-video w-full rounded-lg bg-black object-cover" : "hidden"}
          muted
          playsInline
          aria-label="QR code camera preview"
        />
        {cameraMessage && <p className="mt-2 text-xs text-sage-600">{cameraMessage}</p>}
      </div>
      <label className="block text-sm">
        <span className="text-xs uppercase tracking-wide text-sage-600">Booking reference</span>
        <input
          name="reference"
          required
          value={reference}
          onChange={(event) => setReference(event.target.value.toUpperCase())}
          placeholder="SH-A1B2C3"
          className="mt-1 w-44 rounded-lg border border-forest/20 px-3 py-2 font-mono uppercase"
        />
      </label>
      <label className="block text-sm">
        <span className="text-xs uppercase tracking-wide text-sage-600">Mark as</span>
        <select
          name="state"
          className="mt-1 rounded-lg border border-forest/20 px-3 py-2"
          defaultValue="attended"
        >
          <option value="attended">Attended</option>
          <option value="no_show">No-show</option>
        </select>
      </label>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Check in"}
      </Button>
      {state.message && <p className="w-full text-sm text-forest">{state.message}</p>}
    </form>
  );
}
