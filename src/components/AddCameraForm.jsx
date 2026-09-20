import { useEffect, useRef, useState } from "react";
import { apiFetch } from "../config/api";

export default function AddCameraForm({ onSaved, onCancel }) {
  const [name, setName] = useState("");
  const [rtspUrl, setRtspUrl] = useState("");
  const [showUrl, setShowUrl] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const nameRef = useRef(null);
  const inFlight = useRef(false);
  const active = useRef(true);
  useEffect(() => {
    active.current = true;
    nameRef.current?.focus();
    return () => { active.current = false; };
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    if (inFlight.current) return;
    let parsed;
    try { parsed = new URL(rtspUrl.trim()); } catch { /* Show validation below. */ }
    if (!name.trim()) { setError("Enter a camera name."); return; }
    if (!parsed || !["rtsp:", "rtsps:"].includes(parsed.protocol) || !parsed.hostname) {
      setError("Paste the RTSP stream URL from Scrypted. It should start with rtsp:// or rtsps://.");
      return;
    }
    inFlight.current = true;
    setSaving(true);
    setError("");
    try {
      const response = await apiFetch("/api/cameras", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), rtspUrl: rtspUrl.trim() }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (response.status === 404 || response.status === 405) {
          throw new Error("Adding cameras is not available yet. Restart the updated FamilyHub API and try again.");
        }
        if (response.status === 401 || response.status === 403) {
          throw new Error("FamilyHub could not authorise this request. Check your connection and try again.");
        }
        throw new Error([400, 409].includes(response.status) && typeof data.error === "string" ? data.error : "Unable to save the camera. Please try again.");
      }
      if (!data.camera?.id) throw new Error("The server did not confirm the saved camera. Refresh cameras to check before trying again.");
      if (active.current) {
        setRtspUrl("");
        onSaved(data.camera);
      }
    } catch (err) {
      if (active.current) setError(err instanceof TypeError ? "Could not reach FamilyHub. Check your connection and try again." : err.message);
    } finally {
      inFlight.current = false;
      if (active.current) setSaving(false);
    }
  }

  return (
    <form className="panel camera-add-form" aria-labelledby="add-camera-heading" onSubmit={handleSubmit}>
      <h3 id="add-camera-heading">Add camera</h3>
      <p>Give your camera a name and paste its stream URL from Scrypted.</p>
      <label htmlFor="camera-name">Camera name</label>
      <input ref={nameRef} id="camera-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Front Door" maxLength={80} required disabled={saving} />
      <label htmlFor="camera-stream-url">Scrypted stream URL</label>
      <div className="camera-url-input">
        <input id="camera-stream-url" type={showUrl ? "text" : "password"} value={rtspUrl} onChange={(event) => setRtspUrl(event.target.value)} placeholder="rtsp://…" maxLength={4096} required autoComplete="off" spellCheck={false} autoCapitalize="none" disabled={saving} aria-describedby="camera-url-hint" />
        <button type="button" className="text-button" onClick={() => setShowUrl((value) => !value)} aria-controls="camera-stream-url" aria-label={showUrl ? "Hide stream URL" : "Show stream URL"}>{showUrl ? "Hide" : "Show"}</button>
      </div>
      <p id="camera-url-hint">Use the RTSP stream link, not the camera’s settings page. Connection details are saved on your FamilyHub server.</p>
      {error && <p role="alert" className="camera-form-error">{error}</p>}
      <div className="camera-form-actions">
        <button type="button" className="text-button" disabled={saving} onClick={onCancel}>Cancel</button>
        <button type="submit" className="camera-primary-button" disabled={saving}>{saving ? "Saving…" : "Save camera"}</button>
      </div>
    </form>
  );
}
