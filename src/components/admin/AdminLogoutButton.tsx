"use client";

export function AdminLogoutButton() {
  async function logout() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    window.location.href = "/admin/login";
  }
  return (
    <button type="button" onClick={logout} className="text-strawberry">
      Logout
    </button>
  );
}
