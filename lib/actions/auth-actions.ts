'use server';

import { signIn, signUp, signOut, resetPassword } from '@/lib/supabase/auth';

export async function signInAction(email: string, password: string) {
  return signIn(email, password);
}

export async function signUpAction(email: string, password: string, firstName: string, lastName: string) {
  return signUp(email, password, firstName, lastName);
}

export async function signOutAction() {
  return signOut();
}

export async function resetPasswordAction(email: string, locale: string) {
  return resetPassword(email, locale);
}
