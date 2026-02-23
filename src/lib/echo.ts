import Echo from "laravel-echo";
import Pusher from "pusher-js";

declare global {
  interface Window {
    Pusher: typeof Pusher;
    Echo: Echo<"pusher">;
  }
}

// Make Pusher available globally (required by Laravel Echo)
if (typeof window !== "undefined") {
  window.Pusher = Pusher;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

let echoInstance: Echo<"pusher"> | null = null;

export const getEcho = (): Echo<"pusher"> => {
  if (typeof window === "undefined") {
    throw new Error("Echo can only be used in the browser");
  }

  if (!echoInstance) {
    echoInstance = new Echo({
      broadcaster: "pusher",
      key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY,
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "mt1",
      forceTLS: true,
      authorizer: (channel: { name: string }) => {
        return {
          authorize: (
            socketId: string,
            callback: (error: Error | null, data: { auth: string } | null) => void
          ) => {
            // Get CSRF token from cookie
            const getCsrfToken = (): string | null => {
              const matches = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
              if (matches) {
                return decodeURIComponent(matches[1]);
              }
              return null;
            };

            const csrfToken = getCsrfToken();

            fetch(`${API_URL}/api/broadcasting/auth`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                ...(csrfToken && { "X-XSRF-TOKEN": csrfToken }),
              },
              credentials: "include",
              body: JSON.stringify({
                socket_id: socketId,
                channel_name: channel.name,
              }),
            })
              .then((response) => {
                if (!response.ok) {
                  throw new Error("Broadcasting auth failed");
                }
                return response.json();
              })
              .then((data) => callback(null, data))
              .catch((error) => callback(error, null));
          },
        };
      },
    });
  }

  return echoInstance;
};

export const disconnectEcho = () => {
  if (echoInstance) {
    echoInstance.disconnect();
    echoInstance = null;
  }
};