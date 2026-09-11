import { redirect } from 'next/navigation';
import { ROUTES } from '@/constants/routes';

export default function PracticeTestSummaryRedirectPage() {
  redirect(ROUTES.APP.PRACTICE);
}
