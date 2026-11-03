# Writer (mobile)

Android app to write blog posts from your phone. It talks to GitHub directly: posts are read from and
committed to `src/content/blog`, images go to `public/blog-images`. Saving a non-draft post is a commit
to `master`, so the existing deploy workflow publishes it.

## One-time GitHub setup (sign-in)

Easiest: skip it and paste a **fine-grained token** on the sign-in screen (repo `akshatsonic.github.io`,
permission *Contents: Read and write*). Create one at github.com/settings/personal-access-tokens.

Nicer: sign in with GitHub (device flow).
1. github.com/settings/apps/new. Name it e.g. "Akshat Writer". Homepage URL: your site.
2. Untick **Webhook → Active**. Untick **Expire user authorization tokens**. Tick **Enable Device Flow**.
3. Repository permissions: **Contents → Read and write**. Create the app.
4. Install the app on `akshatsonic.github.io` only (Install App tab).
5. Copy the **Client ID** into `src/config.ts` (`CLIENT_ID`). It is public.

## Build the APK

```bash
cd mobile
npm install --legacy-peer-deps
npx eas-cli login
npx eas-cli build -p android --profile preview
```
EAS prints a link to the `.apk` when done. Open it on the phone and install (allow "install unknown apps").

## Run on a device while developing

`npx expo start` and open in Expo Go (sign-in and posts work there too).
