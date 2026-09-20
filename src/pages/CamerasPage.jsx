import { useRef, useState } from "react";
import { Plus } from "lucide-react";
import HomeCameraPanel from "../components/HomeCameraPanel";
import AddCameraForm from "../components/AddCameraForm";

export default function CamerasPage() {
  const [adding, setAdding] = useState(false);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [notice, setNotice] = useState("");
  const addButtonRef = useRef(null);

  function closeForm() {
    setAdding(false);
    addButtonRef.current?.focus();
  }

  return (
    <div className="apple-home cameras-page">
      <div className="page-title-row camera-page-heading">
        <div><p className="section-kicker">Your home</p><h2>Cameras</h2>
          <p className="page-description">A view of home, all in one place. Tap a camera to watch live.</p>
        </div>
        <button ref={addButtonRef} type="button" className="camera-primary-button" onClick={() => { setNotice(""); setAdding(true); }} aria-expanded={adding}>
          <Plus size={18} aria-hidden="true" /> Add camera
        </button>
      </div>
      {adding && <AddCameraForm onCancel={closeForm} onSaved={(camera) => {
        closeForm();
        setRefreshVersion((value) => value + 1);
        setNotice(`${camera.name} added. Its preview will appear when the camera is reachable.`);
      }} />}
      {notice && <p role="status" className="camera-save-notice">{notice}</p>}
      <HomeCameraPanel directory refreshVersion={refreshVersion} />
      <details className="panel camera-setup-help">
        <summary>Adding another camera</summary>
        <p>Set up your camera in Scrypted and copy its RTSP stream URL. Choose Add camera, enter a name, paste the URL and save.</p>
        <p>Your camera will appear here automatically with its own preview and live view.</p>
      </details>
    </div>
  );
}
