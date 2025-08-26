
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { requestNotificationPermission } from "./lib/notifications";

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js');
  });
}

requestNotificationPermission();

createRoot(document.getElementById("root")!).render(<App />);
  