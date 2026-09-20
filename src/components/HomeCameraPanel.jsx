import { useEffect, useRef, useState } from "react";
import {
  Camera,
  Eye,
  EyeOff,
  Pencil,
} from "lucide-react";
import { apiFetch } from "../config/api";
import LiveCameraFeed from "./LiveCameraFeed";

function CameraCard({
  camera,
  onOpen,
  onEdit,
}) {
  const [url, setUrl] =
    useState("");

  const [status, setStatus] =
    useState("Loading preview…");

  useEffect(() => {
    let controller;
    let active = true;
    let objectUrl = "";
    let timer;

    async function refresh() {
      controller =
        new AbortController();

      const deadline =
        window.setTimeout(
          () =>
            controller.abort(),
          15000
        );

      try {
        const response =
          await apiFetch(
            `/api/cameras/${encodeURIComponent(
              camera.id
            )}/snapshot`,
            {
              cache: "no-store",
              signal:
                controller.signal,
            }
          );

        if (!response.ok) {
          throw new Error(
            "Snapshot unavailable"
          );
        }

        const blob =
          await response.blob();

        if (!active) {
          return;
        }

        if (
          !blob.size ||
          !blob.type.startsWith(
            "image/"
          )
        ) {
          throw new Error(
            "Invalid preview"
          );
        }

        const nextUrl =
          URL.createObjectURL(blob);

        if (objectUrl) {
          URL.revokeObjectURL(
            objectUrl
          );
        }

        objectUrl = nextUrl;

        setUrl(nextUrl);

        setStatus(
          "Preview · Tap to watch live"
        );
      } catch {
        if (active) {
          setStatus(
            objectUrl
              ? "Last preview · Reconnecting…"
              : "Preview unavailable · Tap to try live"
          );
        }
      } finally {
        window.clearTimeout(
          deadline
        );

        if (active) {
          timer =
            window.setTimeout(
              refresh,
              5000
            );
        }
      }
    }

    refresh();

    return () => {
      active = false;

      controller?.abort();

      window.clearTimeout(
        timer
      );

      if (objectUrl) {
        URL.revokeObjectURL(
          objectUrl
        );
      }
    };
  }, [camera.id]);

  return (
    <div className="home-camera-card">
      <button
        type="button"
        className="home-camera-frame"
        onClick={() =>
          onOpen(camera)
        }
        aria-label={`Open ${camera.name} camera`}
      >
        {url ? (
          <img
            src={url}
            alt={`${camera.name} preview`}
          />
        ) : (
          <div className="home-camera-placeholder">
            <Camera size={30} />

            <span>
              {status}
            </span>
          </div>
        )}

        <div className="home-camera-overlay">
          <Camera size={16} />

          <span>
            {camera.name}
          </span>

          {url && (
            <small>
              {status}
            </small>
          )}
        </div>
      </button>

      <button
        type="button"
        className="home-camera-edit-button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onEdit(camera);
        }}
        aria-label={`Edit ${camera.name} camera`}
      >
        <Pencil size={15} />
        <span>Edit</span>
      </button>
    </div>
  );
}

function CameraViewer({ camera, onClose }) {
  const closeRef = useRef(null);
  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();
      if (event.key === "Tab") { event.preventDefault(); closeRef.current?.focus(); }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [onClose]);
  return (
    <div className="home-camera-viewer-backdrop" onClick={onClose}>
      <div className="home-camera-viewer" role="dialog" aria-modal="true" aria-label={`${camera.name} live camera`} onClick={(event) => event.stopPropagation()}>
        <div className="home-camera-viewer-header">
          <div><span className="home-camera-eyebrow">Live camera</span><h2>{camera.name}</h2></div>
          <button ref={closeRef} type="button" className="home-camera-viewer-close" onClick={onClose} aria-label={`Close ${camera.name} camera`}>×</button>
        </div>
        <div className="home-camera-viewer-image"><LiveCameraFeed cameraId={camera.id} cameraName={camera.name} /></div>
      </div>
    </div>
  );
}

function CameraEditor({
  camera,
  onClose,
  onSaved,
  onDeleted,
}) {
  const [name, setName] =
    useState("");

  const [rtspUrl, setRtspUrl] =
    useState("");

  const [showRtsp, setShowRtsp] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const [
    confirmDelete,
    setConfirmDelete,
  ] = useState(false);

  const [error, setError] =
    useState("");

  const closeRef = useRef(null);

  useEffect(() => {
    const controller =
      new AbortController();

    let active = true;

    async function loadSettings() {
      setLoading(true);
      setError("");

      try {
        const response =
          await apiFetch(
            `/api/cameras/${encodeURIComponent(
              camera.id
            )}/settings`,
            {
              cache: "no-store",
              signal:
                controller.signal,
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Unable to load camera settings"
          );
        }

        if (!active) {
          return;
        }

        setName(
          data.camera?.name || ""
        );

        setRtspUrl(
          data.camera?.rtspUrl ||
            ""
        );
      } catch (loadError) {
        if (
          active &&
          loadError.name !==
            "AbortError"
        ) {
          setError(
            loadError.message ||
              "Unable to load camera settings."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadSettings();

    return () => {
      active = false;
      controller.abort();
    };
  }, [camera.id]);

  useEffect(() => {
    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    closeRef.current?.focus();

    function handleKeyDown(
      event
    ) {
      if (
        event.key === "Escape" &&
        !saving &&
        !deleting
      ) {
        if (confirmDelete) {
          setConfirmDelete(false);
        } else {
          onClose();
        }
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    onClose,
    saving,
    deleting,
    confirmDelete,
  ]);

  async function handleSave(
    event
  ) {
    event.preventDefault();

    if (
      saving ||
      deleting
    ) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response =
        await apiFetch(
          `/api/cameras/${encodeURIComponent(
            camera.id
          )}`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              name,
              rtspUrl,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to save camera"
        );
      }

      onSaved(
        data.camera
      );
    } catch (saveError) {
      setError(
        saveError.message ||
          "Unable to save camera."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (deleting) {
      return;
    }

    setDeleting(true);
    setError("");

    try {
      const response =
        await apiFetch(
          `/api/cameras/${encodeURIComponent(
            camera.id
          )}`,
          {
            method: "DELETE",
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to delete camera"
        );
      }

      onDeleted(
        data.camera
      );
    } catch (deleteError) {
      setError(
        deleteError.message ||
          "Unable to delete camera."
      );

      setConfirmDelete(false);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div
      className="camera-editor-backdrop"
      onClick={() => {
        if (
          !saving &&
          !deleting
        ) {
          onClose();
        }
      }}
    >
      <div
        className="camera-editor-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="camera-editor-title"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <div className="camera-editor-header">
          <div>
            <span className="home-camera-eyebrow">
              Camera settings
            </span>

            <h2 id="camera-editor-title">
              Edit {camera.name}
            </h2>
          </div>

          <button
            ref={closeRef}
            type="button"
            className="home-camera-viewer-close"
            onClick={onClose}
            disabled={
              saving ||
              deleting
            }
            aria-label="Close camera settings"
          >
            ×
          </button>
        </div>

        {loading ? (
          <div className="camera-editor-loading">
            Loading camera settings…
          </div>
        ) : (
          <form
            className="camera-editor-form"
            onSubmit={handleSave}
          >
            <label className="camera-editor-field">
              <span>
                Camera name
              </span>

              <input
                type="text"
                value={name}
                maxLength={80}
                autoComplete="off"
                onChange={(event) =>
                  setName(
                    event.target.value
                  )
                }
              />
            </label>

            <label className="camera-editor-field">
              <span>
                RTSP URL
              </span>

              <div className="camera-editor-secret-field">
                <input
                  type={
                    showRtsp
                      ? "text"
                      : "password"
                  }
                  value={rtspUrl}
                  autoComplete="off"
                  spellCheck="false"
                  onChange={(event) =>
                    setRtspUrl(
                      event.target.value
                    )
                  }
                />

                <button
                  type="button"
                  className="camera-editor-reveal"
                  onClick={() =>
                    setShowRtsp(
                      (current) =>
                        !current
                    )
                  }
                  aria-label={
                    showRtsp
                      ? "Hide RTSP URL"
                      : "Show RTSP URL"
                  }
                >
                  {showRtsp ? (
                    <EyeOff
                      size={18}
                    />
                  ) : (
                    <Eye
                      size={18}
                    />
                  )}
                </button>
              </div>

              <small>
                The RTSP URL is stored
                on your FamilyHub server.
              </small>
            </label>

            {error && (
              <div
                className="camera-editor-error"
                role="alert"
              >
                {error}
              </div>
            )}

            {confirmDelete && (
              <div className="camera-delete-confirm">
                <div>
                  <strong>
                    Delete {camera.name}?
                  </strong>

                  <p>
                    This removes the camera
                    from FamilyHub only. It
                    will not change the
                    camera or Scrypted.
                  </p>
                </div>

                <div className="camera-delete-confirm-actions">
                  <button
                    type="button"
                    className="camera-delete-confirm-cancel"
                    disabled={deleting}
                    onClick={() =>
                      setConfirmDelete(
                        false
                      )
                    }
                  >
                    Keep Camera
                  </button>

                  <button
                    type="button"
                    className="camera-delete-confirm-delete"
                    disabled={deleting}
                    onClick={
                      handleDelete
                    }
                  >
                    {deleting
                      ? "Deleting…"
                      : "Delete Camera"}
                  </button>
                </div>
              </div>
            )}

            <div className="camera-editor-actions">
              <button
                type="button"
                className="camera-editor-delete"
                disabled={
                  saving ||
                  deleting
                }
                onClick={() =>
                  setConfirmDelete(
                    true
                  )
                }
              >
                Delete Camera
              </button>

              <div className="camera-editor-actions-right">
                <button
                  type="button"
                  className="camera-editor-cancel"
                  onClick={onClose}
                  disabled={
                    saving ||
                    deleting
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="camera-editor-save"
                  disabled={
                    saving ||
                    deleting ||
                    !name.trim() ||
                    !rtspUrl.trim()
                  }
                >
                  {saving
                    ? "Saving…"
                    : "Save"}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function HomeCameraPanel({
  directory = false,
  onViewAll,
  refreshVersion = 0,
}) {
  const [cameras, setCameras] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [refreshKey, setRefreshKey] =
    useState(0);

  const [
    selectedCamera,
    setSelectedCamera,
  ] = useState(null);

  const [
    editingCamera,
    setEditingCamera,
  ] = useState(null);

  const closeViewer =
    useRef(
      () =>
        setSelectedCamera(null)
    ).current;

  const closeEditor =
    useRef(
      () =>
        setEditingCamera(null)
    ).current;

  useEffect(() => {
    const controller =
      new AbortController();

    let active = true;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const response =
          await apiFetch(
            "/api/cameras",
            {
              cache: "no-store",
              signal:
                controller.signal,
            }
          );

        if (!response.ok) {
          throw new Error(
            "Unable to load cameras"
          );
        }

        const data =
          await response.json();

        if (
          !Array.isArray(
            data.cameras
          )
        ) {
          throw new Error(
            "Invalid camera list"
          );
        }

        if (active) {
          setCameras(
            data.cameras
          );
        }
      } catch {
        if (active) {
          setError(
            "Unable to load cameras. Please try again."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      active = false;
      controller.abort();
    };
  }, [
    refreshKey,
    refreshVersion,
  ]);

  function handleCameraSaved(
    updatedCamera
  ) {
    setEditingCamera(null);

    if (updatedCamera?.id) {
      setSelectedCamera(
        (current) => {
          if (
            current?.id !==
            updatedCamera.id
          ) {
            return current;
          }

          return {
            ...current,
            ...updatedCamera,
          };
        }
      );
    }

    setRefreshKey(
      (value) =>
        value + 1
    );
  }

  function handleCameraDeleted(
    deletedCamera
  ) {
    setEditingCamera(null);

    setSelectedCamera(
      (current) =>
        current?.id ===
        deletedCamera?.id
          ? null
          : current
    );

    setCameras(
      (current) =>
        current.filter(
          (camera) =>
            camera.id !==
            deletedCamera?.id
        )
    );

    setRefreshKey(
      (value) =>
        value + 1
    );
  }

  const visibleCameras =
    directory
      ? cameras
      : cameras.slice(0, 1);

  return (
    <>
      <section
        className="panel home-camera-panel"
        aria-label={
          directory
            ? "All cameras"
            : "Camera preview"
        }
      >
        <div className="home-camera-heading">
          <div>
            <span className="home-camera-eyebrow">
              {directory
                ? `All cameras (${cameras.length})`
                : "Cameras"}
            </span>
          </div>

          {directory ? (
            <button
              type="button"
              className="text-button"
              disabled={loading}
              onClick={() =>
                setRefreshKey(
                  (value) =>
                    value + 1
                )
              }
            >
              {loading
                ? "Refreshing…"
                : "Refresh cameras"}
            </button>
          ) : (
            onViewAll && (
              <button
                type="button"
                className="text-button"
                onClick={onViewAll}
              >
                View all
              </button>
            )
          )}
        </div>

        {error && (
          <div
            role="alert"
            className="camera-list-message"
          >
            {error}{" "}

            <button
              type="button"
              className="text-button"
              onClick={() =>
                setRefreshKey(
                  (value) =>
                    value + 1
                )
              }
            >
              Retry
            </button>
          </div>
        )}

        {loading &&
          cameras.length === 0 && (
            <p
              role="status"
              className="camera-list-message"
            >
              Loading cameras…
            </p>
          )}

        {!loading &&
          !error &&
          cameras.length === 0 && (
            <p className="camera-list-message">
              No cameras added yet.
              Once a camera is
              connected to FamilyHub,
              it will appear here.
            </p>
          )}

        <div className="home-camera-grid">
          {visibleCameras.map(
            (camera) => (
              <CameraCard
                key={camera.id}
                camera={camera}
                onOpen={
                  setSelectedCamera
                }
                onEdit={
                  setEditingCamera
                }
              />
            )
          )}
        </div>
      </section>

      {selectedCamera && (
        <CameraViewer
          camera={selectedCamera}
          onClose={closeViewer}
        />
      )}

      {editingCamera && (
        <CameraEditor
          camera={editingCamera}
          onClose={closeEditor}
          onSaved={
            handleCameraSaved
          }
          onDeleted={
            handleCameraDeleted
          }
        />
      )}
    </>
  );
}
