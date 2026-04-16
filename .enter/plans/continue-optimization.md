# Fix: Auth Pending Query Race Condition

## Context
After signup/login, the pending query (saved before auth gate) should be automatically sent.
The current `onSuccess` callback pattern has a race condition: `handleAuthSuccess` closes over
the old `handleSubmit` where `user` is still `null`, so the auth gate triggers again.

## Root Cause
```
signUp() resolves
  → onAuthStateChange fires (async) → schedules setUser(newUser)
  → onSuccess() called synchronously → handleAuthSuccess() → setTimeout(handleSubmit, 100)
  → 100ms later: handleSubmit runs with OLD closure (user=null) → auth gate fires again
```

## Fix (Index.tsx only)

1. **Remove** `handleAuthSuccess` and the `onSuccess` prop on `<AuthModal>`
2. **Add** a `useEffect` that watches `[user, pendingQuery, handleSubmit]`:

```ts
// After user logs in, React has applied setUser — handleSubmit closure is now user!=null
useEffect(() => {
  if (user && pendingQuery) {
    const q = pendingQuery;
    setPendingQuery(null);
    handleSubmit(q);
  }
}, [user, pendingQuery, handleSubmit]);
```

## Files to Change
- `src/pages/Index.tsx`
  - Delete lines 82-88 (`handleAuthSuccess` useCallback)
  - Add the `useEffect` above after the existing scroll effects
  - Change `<AuthModal ... onSuccess={handleAuthSuccess} />` → `<AuthModal open={authOpen} onOpenChange={setAuthOpen} />`

## Verification
1. Type a question without being logged in → auth modal opens
2. Register new account → modal closes → question is sent automatically
3. Open modal again (e.g. via sidebar) → login → question from last session NOT re-sent (pendingQuery is null)
