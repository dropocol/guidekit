export async function verifyEmail(token: string) {
  const res = await fetch("/api/auth/verify-email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token }),
  });

  if (!res.ok) {
    throw new Error("Failed to verify email");
  }

  return res.json();
}
