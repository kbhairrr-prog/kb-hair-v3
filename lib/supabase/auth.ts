import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { Locale } from '@/types';

export async function getSession() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function getUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getCustomerProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('customers')
    .select('*, addresses(*)')
    .eq('auth_id', user.id)
    .single();

  return data;
}

export async function requireAuth(locale: string) {
  const user = await getUser();
  if (!user) redirect(`/${locale}/account/login`);
  return user;
}

export async function signIn(email: string, password: string) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return { error: error?.message ?? null };
}

export async function signUp(email: string, password: string, firstName: string, lastName: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email, password,
    options: { data: { first_name: firstName, last_name: lastName } }
  });

  if (!error && data.user) {
    // Créer le profil client
    await supabase.from('customers').insert({
      auth_id: data.user.id,
      email,
      first_name: firstName,
      last_name: lastName,
    });
  }

  return { error: error?.message ?? null };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
}

export async function updatePassword(newPassword: string) {
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  return { error: error?.message ?? null };
}

export async function resetPassword(email: string, locale: string) {
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/account/reset-password`,
  });
  return { error: error?.message ?? null };
}
