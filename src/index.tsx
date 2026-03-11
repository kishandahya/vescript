import { render } from "solid-js/web";
import { ConvexClientProvider } from "../hotel-frontend/data/convex-client";
import HotelDashboard from "../hotel-frontend/hotel-dashboard";
import "../hotel-frontend/index.css";

const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");

const convexUrl = import.meta.env.VITE_CONVEX_URL as string | undefined;

if (convexUrl) {
  render(
    () => (
      <ConvexClientProvider url={convexUrl!}>
        <HotelDashboard />
      </ConvexClientProvider>
    ),
    root
  );
} else {
  console.warn("VITE_CONVEX_URL not set — running with demo data only");
  render(() => <HotelDashboard />, root);
}
