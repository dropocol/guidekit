import ResetPasswordForm from "./form";

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: { token: string };
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <h1 className="mb-8 text-4xl font-bold">Reset Password</h1>
      <ResetPasswordForm token={searchParams.token} />
    </div>
  );
}
