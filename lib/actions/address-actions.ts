'use server';

import { upsertAddress, deleteAddress } from '@/lib/supabase/customer-queries';

export async function upsertAddressAction(data: Parameters<typeof upsertAddress>[0]) {
  return upsertAddress(data);
}

export async function deleteAddressAction(id: string) {
  return deleteAddress(id);
}
