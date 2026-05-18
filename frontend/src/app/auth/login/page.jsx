import { LoginForm } from '@/features/auth/components';
import AuthMockupCard from '@/features/auth/components/AuthMockupCard';

export const metadata = {
  title: 'Login | MummaXpress',
  description: 'Login to your MummaXpress account',
};

export default function LoginPage() {
  return (
    <AuthMockupCard>
      <LoginForm compact />
    </AuthMockupCard>
  );
}
