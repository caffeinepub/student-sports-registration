import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import AdminDashboard from "./pages/AdminDashboard";
import RegistrationPage from "./pages/RegistrationPage";
import SuccessPage from "./pages/SuccessPage";

export type Page = "home" | "success" | "admin";

export default function App() {
  const [page, setPage] = useState<Page>(() => {
    const hash = window.location.hash;
    if (hash.includes("admin")) return "admin";
    return "home";
  });
  const [registrationId, setRegistrationId] = useState<bigint | null>(null);

  const navigate = (p: Page) => {
    setPage(p);
    if (p === "admin") {
      window.location.hash = "#admin";
    } else if (p === "home") {
      window.location.hash = "#home";
    }
  };

  const handleSuccess = (id: bigint) => {
    setRegistrationId(id);
    setPage("success");
  };

  return (
    <>
      {page === "home" && (
        <RegistrationPage
          onSuccess={handleSuccess}
          onAdminClick={() => navigate("admin")}
        />
      )}
      {page === "success" && (
        <SuccessPage
          registrationId={registrationId!}
          onRegisterAnother={() => navigate("home")}
          onAdminClick={() => navigate("admin")}
        />
      )}
      {page === "admin" && <AdminDashboard onBack={() => navigate("home")} />}
      <Toaster />
    </>
  );
}
