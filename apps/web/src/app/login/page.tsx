import { LoginExperience } from './login-experience';
import { isLocalAdminLoginEnabled } from '@/lib/validation/env';

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  return <LoginExperience adminEnabled={isLocalAdminLoginEnabled()} />;
}
