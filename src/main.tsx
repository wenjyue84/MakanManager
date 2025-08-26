import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { requestNotificationPermission } from "./lib/notifications";

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      await navigator.serviceWorker.register('/sw.js');
      await requestNotificationPermission();
    } catch (e) {
      console.error('Service worker registration failed', e);
    }
  });
} else {
  requestNotificationPermission();
}

createRoot(document.getElementById("root")!).render(<App />);
  