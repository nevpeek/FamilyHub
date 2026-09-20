/* Check for shared changes every five seconds.
   Each subscriber waits for its previous request to finish. */
export function startAutoRefresh(refresh) {
  let stopped = false;
  let running = false;

  async function runRefresh() {
    if (stopped || running || !navigator.onLine) {
      return;
    }

    running = true;

    try {
      await refresh();
    } catch (error) {
      if (!stopped && error.name !== "AbortError") {
        console.error("FamilyHub auto-refresh failed:", error);
      }
    } finally {
      running = false;
    }
  }

  function handleVisibilityChange() {
    if (document.visibilityState === "visible") {
      runRefresh();
    }
  }

  const interval = window.setInterval(runRefresh, 5000);

  window.addEventListener("online", runRefresh);
  window.addEventListener("focus", runRefresh);
  document.addEventListener(
    "visibilitychange",
    handleVisibilityChange
  );

  return () => {
    stopped = true;
    window.clearInterval(interval);

    window.removeEventListener("online", runRefresh);
    window.removeEventListener("focus", runRefresh);
    document.removeEventListener(
      "visibilitychange",
      handleVisibilityChange
    );
  };
}