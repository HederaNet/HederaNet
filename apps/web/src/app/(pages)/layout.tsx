import type { ReactNode } from 'react';
import { StandalonePageLayout } from '../../components/dashboard/StandalonePageLayout';

export default function Layout({ children }: { children: ReactNode }) {
  return <StandalonePageLayout>{children}</StandalonePageLayout>;
}
