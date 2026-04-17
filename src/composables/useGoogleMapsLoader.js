let loadPromise = null;

export function loadGoogleMaps(apiKey) {
  if (!apiKey) return Promise.reject(new Error("Missing Google Maps API key"));
  if (typeof window !== "undefined" && window.google?.maps?.places)
    return Promise.resolve();
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const id = "google-maps-js";
    if (document.getElementById(id)) {
      const t = window.setInterval(() => {
        if (window.google?.maps?.places) {
          window.clearInterval(t);
          resolve();
        }
      }, 50);
      window.setTimeout(() => {
        window.clearInterval(t);
        reject(new Error("Google Maps load timeout"));
      }, 20000);
      return;
    }
    const s = document.createElement("script");
    s.id = id;
    s.async = true;
    s.defer = true;
    s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places`;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load Google Maps"));
    document.head.appendChild(s);
  });

  return loadPromise;
}
