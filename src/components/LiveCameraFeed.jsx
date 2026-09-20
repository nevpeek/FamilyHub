import { useEffect, useState } from "react";
import { Camera } from "lucide-react";
import { apiFetch } from "../config/api";

function findMarker(buffer, first, second, start = 0) {
  for (let index = start; index < buffer.length - 1; index += 1) {
    if (
      buffer[index] === first &&
      buffer[index + 1] === second
    ) {
      return index;
    }
  }

  return -1;
}

function joinBuffers(first, second) {
  const combined = new Uint8Array(
    first.length + second.length
  );

  combined.set(first, 0);
  combined.set(second, first.length);

  return combined;
}

export default function LiveCameraFeed({
  cameraId = "garage",
  cameraName = "Garage",
}) {
  const [frameUrl, setFrameUrl] = useState("");
  const [error, setError] = useState("");
  const [connecting, setConnecting] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    let active = true;
    let buffer = new Uint8Array(0);
    let currentFrameUrl = "";

    async function startLiveFeed() {
      try {
        setConnecting(true);
        setError("");

        const response = await apiFetch(
          `/api/cameras/${cameraId}/live`,
          {
            signal: controller.signal,
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            `Live camera returned ${response.status}`
          );
        }

        if (!response.body) {
          throw new Error(
            "Live camera stream is unavailable"
          );
        }

        setConnecting(false);

        const reader = response.body.getReader();

        while (active) {
          const { value, done } =
            await reader.read();

          if (done || !active) {
            break;
          }

          buffer = joinBuffers(
            buffer,
            value
          );

          while (true) {
            const jpegStart = findMarker(
              buffer,
              0xff,
              0xd8
            );

            if (jpegStart === -1) {
              if (buffer.length > 2_000_000) {
                buffer = new Uint8Array(0);
              }

              break;
            }

            const jpegEnd = findMarker(
              buffer,
              0xff,
              0xd9,
              jpegStart + 2
            );

            if (jpegEnd === -1) {
              if (jpegStart > 0) {
                buffer =
                  buffer.slice(jpegStart);
              }

              break;
            }

            const frameBytes =
              buffer.slice(
                jpegStart,
                jpegEnd + 2
              );

            buffer =
              buffer.slice(jpegEnd + 2);

            const blob = new Blob(
              [frameBytes],
              {
                type: "image/jpeg",
              }
            );

            const nextFrameUrl =
              URL.createObjectURL(blob);

            if (currentFrameUrl) {
              URL.revokeObjectURL(
                currentFrameUrl
              );
            }

            currentFrameUrl =
              nextFrameUrl;

            if (active) {
              setFrameUrl(
                nextFrameUrl
              );
            }
          }
        }
      } catch (err) {
        if (
          !active ||
          err.name === "AbortError"
        ) {
          return;
        }

        console.error(
          "Live camera feed error:",
          err
        );

        setError(
          "Live feed unavailable"
        );

        setConnecting(false);
      }
    }

    startLiveFeed();

    return () => {
      active = false;
      controller.abort();

      if (currentFrameUrl) {
        URL.revokeObjectURL(
          currentFrameUrl
        );
      }
    };
  }, [cameraId]);

  if (frameUrl) {
    return (
      <img
        src={frameUrl}
        alt={`${cameraName} live camera`}
      />
    );
  }

  return (
    <div className="home-camera-live-placeholder">
      <Camera size={34} />

      <span>
        {connecting
          ? "Connecting to live camera…"
          : error || "Live feed unavailable"}
      </span>
    </div>
  );
}