import { AuthLayout } from "@/components/auth/AuthLayout";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata = {
  title: "Create Account | AetherVOX",
  description: "Create your AetherVOX account",
};

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start translating globally with AetherVOX"
    >
      <RegisterForm />
    </AuthLayout>
  );
}
