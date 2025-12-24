import { createClient as createBrowserClient } from '@/lib/supabase/client'
import type { SignUpFormData, LoginFormData } from '@/lib/validations/auth'
import { parseAuthError } from '@/lib/utils/errors'

export async function signUp(data: SignUpFormData) {
  const supabase = createBrowserClient()
  
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
          phone: data.phone,
        },
      },
    })

    if (authError) {
      const parsedError = parseAuthError(authError)
      throw new Error(parsedError.message)
    }

    return authData
  } catch (error: any) {
    // Re-parse the error in case it's not from Supabase
    const parsedError = parseAuthError(error)
    throw new Error(parsedError.message)
  }
}

export async function signIn(data: LoginFormData) {
  const supabase = createBrowserClient()
  
  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (authError) {
      const parsedError = parseAuthError(authError)
      throw new Error(parsedError.message)
    }

    return authData
  } catch (error: any) {
    // Re-parse the error in case it's not from Supabase
    const parsedError = parseAuthError(error)
    throw new Error(parsedError.message)
  }
}

export async function signOut() {
  const supabase = createBrowserClient()
  await supabase.auth.signOut()
}

export async function getCurrentUser() {
  const supabase = createBrowserClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return { ...user, profile }
}