# Sharpener React Signup Assignment

## Setup

```bash
npm install
npm run dev
```

## Firebase setup

1. Create/open a Firebase project.
2. Go to Authentication -> Sign-in method.
3. Enable Email/Password.
4. Go to Project settings -> Your apps -> Web app.
5. Copy the Firebase configuration.
6. Replace the placeholder values in `src/firebase.js`.

## Assignment requirements covered

- React.js
- React-Bootstrap
- Email, Password and Confirm Password
- Required field validation
- Password match validation
- Firebase Email/Password authentication
- Firebase error handling
- Success console log:
  `User has successfully signed up`

## Git submission

After testing:

```bash
git init
git add .
git commit -m "Create signup screen with Firebase authentication"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```

Then submit the commit ID from:

```bash
git rev-parse HEAD
```