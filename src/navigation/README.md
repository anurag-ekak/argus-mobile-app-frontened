# src/navigation — navigators

React Navigation stack + tabs. Mirrors the web app's `src/app/**` route tree:
React Native has no URL router, so screens live in `src/screens/` and are wired
here. The role-dependent home landing (Super Admin → Overview of Argus,
Managerial → Overview of LP, Waiter/Employee → Today's Loyal) is resolved here.
