import AuthForm from "./AuthForm";

export default function AuthPage({
  searchParams,
}: {
  searchParams: { error?: string; redirect?: string; register?: string };
}) {
  return (
    <AuthForm
      error={searchParams.error}
      redirect={searchParams.redirect}
      isRegister={searchParams.register === "1"}
    />
  );
}
