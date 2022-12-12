# Using Middlecat Authentication in React

This is a hook for using MiddleCat authentication. See the [ccs-amsterdam/middlecat](https://github.com/ccs-amsterdam/middlecat) repository for details about what on earth Middlecat is supposed to be.

# Using the hook

First install the middlecat-react NPM module

```
npm install middlecat-react
```

Then use the hook to get a user and AuthForm component.

```
function Component() {
  const { user, AuthForm } = useMiddlecat();

  return <AuthForm />
}
```

The user object contains basic user details (email, name, image) and an Axios instance called 'api'. The Axios instance already has the base_url set to the host that a user connected to, and the access_token is added securely (insofar as possible) by intercepting the requests. Refresh token rotation is handled behind
the scenes, so the user.api should be all that you really need.

The AuthForm is a component for a Login/Logout screen. It is also possible to make a custom screen, for which useMiddlecat returns the signIn and signOut methods and a loading state.
