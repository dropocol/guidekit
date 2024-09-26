import ForgotPasswordForm from "./form";

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <h1 className="mb-8 text-4xl font-bold">Forgot Password</h1>
      <ForgotPasswordForm />
    </div>
  );
}
