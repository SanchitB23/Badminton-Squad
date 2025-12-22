import { createClient as createBrowserClient } from '@/lib/supabase/client'
import type { SignUpFormData, LoginFormData } from '@/lib/validations/auth'

export async function signUp(data: SignUpFormData) {
  const supabase = createBrowserClient()
  
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
    throw new Error(authError.message)
  }

  return authData
}

export async function signIn(data: LoginFormData) {
  const supabase = createBrowserClient()
  
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  })

  if (authError) {
    throw new Error(authError.message)
  }

  return authData
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