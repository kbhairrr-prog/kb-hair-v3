'use server';

import { updateCustomerProfile } from '@/lib/supabase/customer-queries';
import { updatePassword } from '@/lib/supabase/auth';

export async function updateProfileAction(customerId: string, data: {
  first_name?: string;
  last_name?: string;
  phone?: string;
}) {
  return updateCustomerProfile(customerId, data);
}

export async function updatePasswordAction(newPassword: string) {
  return updatePassword(newPassword);
}
