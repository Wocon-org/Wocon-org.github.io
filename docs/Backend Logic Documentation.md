# Backend Logic Documentation

## Overview

This document provides a comprehensive overview of the backend logic for the WOCON application, with a specific focus on the authentication system. The purpose is to ensure that new development teams can seamlessly understand and maintain the codebase.

## Technology Stack

- **Backend Service**: Supabase
- **Authentication Methods**:
  - Email/password authentication
  - OAuth authentication (GitHub, Google, Facebook)
- **Database**: Supabase PostgreSQL
- **Frontend Framework**: Vue 3 with Composition API
- **Language**: TypeScript

## Authentication Architecture

The authentication system is built on top of Supabase Auth, which provides a secure and scalable authentication solution. The frontend communicates with Supabase Auth endpoints to handle user authentication.

### Key Components

1. **Supabase Client**: Configured in `src/lib/supabase.ts`
2. **Authentication Store**: Manages auth state in `src/stores/auth.ts`
3. **Login/Signup Components**: `src/views/Login.vue` and `src/views/Signup.vue`
4. **Route Guards**: Implemented in `src/router/index.ts`

## Login Flow

### 1. Email/Password Login

#### Frontend Flow

1. **User Input**: User enters email/username and password in the login form
2. **Input Validation**: Frontend validates input format
3. **Authentication Request**: `loginWithPassword` function is called
4. **Backend Communication**: Supabase Auth API is called with credentials
5. **Response Handling**: Handle success/failure responses
6. **State Management**: Update auth store with user session
7. **Route Redirection**: Redirect to appropriate page

#### Backend Flow

1. **Credential Verification**: Supabase Auth verifies email/password combination
2. **Session Creation**: If valid, creates a user session
3. **Token Generation**: Generates JWT tokens for authentication
4. **Response**: Returns session data or error message

### 2. OAuth Login

#### Frontend Flow

1. **User Initiation**: User clicks on OAuth provider button (GitHub/Google/Facebook)
2. **Redirect**: User is redirected to provider's authentication page
3. **Provider Authentication**: User authenticates with the provider
4. **Callback**: Provider redirects back to application with authorization code
5. **Token Exchange**: Supabase exchanges code for tokens
6. **Session Creation**: Supabase creates user session
7. **State Update**: Frontend updates auth state

#### Backend Flow

1. **OAuth Redirect**: Supabase Auth handles OAuth flow
2. **Token Exchange**: Exchanges authorization code for access token
3. **User Creation/Update**: Creates new user or updates existing one
4. **Session Management**: Creates user session and returns tokens

## Key Authentication Functions

### Password Login Function

```typescript
// In src/views/Login.vue
const loginWithPassword = async () => {
  if (!isValidInput()) {
    if (password.value.length < 6) {
      toast('Password must be at least 6 characters')
    }
    return
  }

  loading.value = true

  // Check if input is email or username
  const isEmail = emailOrUsername.value.includes('@')

  try {
    let error
    if (isEmail) {
      // Login with email
      const result = await supabase.auth.signInWithPassword({
        email: emailOrUsername.value,
        password: password.value
      })
      error = result.error
    } else {
      // Login with username - use RPC function to get email
      const { data: profile, error: profileError } = await supabase.rpc('get_profile_by_username', {
        username_param: emailOrUsername.value
      })

      if (profileError || !profile || profile.length === 0) {
        toast('User not found. Please check your username or verify your email.')
        loading.value = false
        return
      }

      const result = await supabase.auth.signInWithPassword({
        email: profile[0].email,
        password: password.value
      })
      error = result.error
    }

    loading.value = false
    if (error) {
      if (error.message.includes('Email not confirmed')) {
        toast('Please verify your email first. Check your inbox for the verification link.')
      } else {
        toast(error.message)
      }
    } else {
      toast('Login successful! ✅')
    }
  } catch {
    loading.value = false
    toast('Login failed. Please try again.')
  }
}
```

### OAuth Login Function

```typescript
// In src/views/Login.vue
const loginWithOAuth = async (provider: 'github' | 'google' | 'facebook') => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: window.location.origin + '/login/callback' }
  })
  if (error) {
    toast(`${provider} login failed. Please try again.`)
  }
}
```

### Signup Function

```typescript
// In src/views/Signup.vue
const signup = async () => {
  if (!isValidEmail.value || !isValidUsername.value || !isValidNickname.value || !isValidPassword.value) return
  loading.value = true
  const { data, error } = await supabase.auth.signUp({
    email: email.value,
    password: password.value,
    options: {
      emailRedirectTo: `${window.location.origin}/login`,
      data: { username: username.value, nickname: nickname.value },
    },
  })

  loading.value = false

  if (error) {
    toast(error.message)
  } else if (data.user && !data.session) {
    // Email confirmation required
    toast('Account created! Check your email to verify ✉️')
    setTimeout(() => router.push('/login'), 3000)
  } else if (data.user && data.session) {
    // Auto-signed in (email confirmation disabled or already confirmed)
    router.push('/')
  }
}
```

## Session Management

### Auth State Change Listener

```typescript
// In src/views/Login.vue and src/views/Signup.vue
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' && session) {
    router.push(route.query.redirect as string || '/')
  }
})
```

### Route Guards

```typescript
// In src/router/index.ts
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated

  // Local development mode: Disable authentication
  const devMode = import.meta.env.DEV

  if (devMode) {
    // Skip all authentication checks in development mode
    next()
    return
  }

  // Pages that require authentication
  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } })
  }
  // Guest-only pages (logged-in users cannot access)
  else if (to.meta.guestOnly && isAuthenticated) {
    next({ name: 'home' })
  }
  else {
    next()
  }
})
```

## Database Schema

### Key Tables

1. **profiles**
   - `id` (UUID): Primary key
   - `email` (String): User email
   - `username` (String): User username
   - `nickname` (String): User display name
   - `avatar_url` (String): User avatar
   - `created_at` (Timestamp): Account creation time

2. **trips**
   - `id` (UUID): Primary key
   - `name` (String): Trip name
   - `type` (String): Trip type (private/recruiting)
   - `max_participants` (Integer): Maximum number of participants
   - `description` (Text): Trip description
   - `is_public` (Boolean): Public visibility
   - `owner_id` (UUID): Trip owner
   - `created_at` (Timestamp): Creation time

3. **trip_participants**
   - `id` (UUID): Primary key
   - `trip_id` (UUID): Trip reference
   - `user_id` (UUID): User reference
   - `status` (String): Participation status (pending/accepted)
   - `joined_at` (Timestamp): Join time

4. **map_markers**
   - `id` (UUID): Primary key
   - `trip_id` (UUID): Trip reference
   - `lat` (Float): Latitude
   - `lng` (Float): Longitude
   - `created_at` (Timestamp): Creation time

## API Endpoints

### Authentication Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/v1/token` | POST | Exchange code for token |
| `/auth/v1/token` | PUT | Refresh token |
| `/auth/v1/token` | DELETE | Revoke token |
| `/auth/v1/user` | GET | Get user info |
| `/auth/v1/user` | PUT | Update user info |
| `/auth/v1/logout` | POST | Logout user |

### Database Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/rest/v1/profiles` | GET | Get profiles |
| `/rest/v1/profiles` | POST | Create profile |
| `/rest/v1/profiles/:id` | PATCH | Update profile |
| `/rest/v1/trips` | GET | Get trips |
| `/rest/v1/trips` | POST | Create trip |
| `/rest/v1/trips/:id` | PATCH | Update trip |
| `/rest/v1/trip_participants` | GET | Get trip participants |
| `/rest/v1/trip_participants` | POST | Add trip participant |
| `/rest/v1/map_markers` | GET | Get map markers |
| `/rest/v1/map_markers` | POST | Create map marker |

## Error Handling

### Common Error Scenarios

1. **Invalid Credentials**: Wrong email/password combination
2. **Email Not Confirmed**: User hasn't verified email address
3. **Rate Limiting**: Too many authentication attempts
4. **Network Errors**: Connection issues with Supabase
5. **OAuth Failures**: Provider-specific authentication issues

### Error Handling Strategy

1. **Frontend Validation**: Validate inputs before sending requests
2. **Try-Catch Blocks**: Handle async errors gracefully
3. **User Feedback**: Display user-friendly error messages
4. **Logging**: Log errors for debugging purposes
5. **Fallback Mechanisms**: Provide alternative authentication methods

## Security Considerations

1. **HTTPS**: All requests use HTTPS encryption
2. **JWT Tokens**: Secure token-based authentication
3. **Password Hashing**: Supabase handles secure password storage
4. **Email Verification**: Optional email verification for new accounts
5. **Rate Limiting**: Protection against brute force attacks
6. **CORS Configuration**: Restrict cross-origin requests
7. **Session Expiration**: Tokens have limited lifetimes

## New Team Onboarding

### Setup Process

1. **Supabase Project**: Create a new Supabase project
2. **Environment Variables**: Configure `.env` file with Supabase credentials
3. **Database Schema**: Replicate database schema using SQL migrations
4. **Authentication Providers**: Enable OAuth providers in Supabase dashboard
5. **Email Templates**: Configure email templates for verification and password reset
6. **Testing**: Test authentication flows with test accounts

### Key Configuration Files

1. **.env**: Contains Supabase project URL and anon key
2. **src/lib/supabase.ts**: Supabase client configuration
3. **src/stores/auth.ts**: Authentication state management
4. **src/router/index.ts**: Route guards and authentication logic

### Development Workflow

1. **Local Development**: Use development Supabase project
2. **Staging**: Test with staging Supabase project
3. **Production**: Deploy to production Supabase project

### Troubleshooting Guide

1. **Authentication Failures**:
   - Check Supabase project settings
   - Verify environment variables
   - Test network connectivity
   - Review browser console errors

2. **Session Issues**:
   - Clear browser storage
   - Check token expiration settings
   - Verify CORS configuration

3. **Database Errors**:
   - Check database schema matches expected structure
   - Verify RLS policies are correctly configured
   - Test database functions (e.g., `get_profile_by_username`)

## Conclusion

This documentation provides a comprehensive overview of the backend logic, with a focus on the authentication system. By following these guidelines, new development teams should be able to seamlessly understand, maintain, and extend the codebase. The use of Supabase as the backend service provides a scalable and secure foundation for the application's authentication needs.

For further assistance, refer to the Supabase documentation or contact the previous development team for specific project details.