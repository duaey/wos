import AdminClient from "./AdminClient";

export const metadata = { title: "Yönetim — WOS Takip" };

export default function AdminPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Yönetim</h1>
      <AdminClient />
    </div>
  );
}
