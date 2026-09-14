"use client";

export function AdminLogoutButton({ className }: { className?: string }) {
  async function logout() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    window.location.href = "/admin/login";
  }
  return (
    <button
      type="button"
      onClick={logout}
      className={
        className ||
        "text-sm font-semibold text-plum underline-offset-2 hover:underline"
      }
    >
      Logout
    </button>
  );
}
