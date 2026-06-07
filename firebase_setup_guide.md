# Firebase & Database Live Setup Guide

To transition **SevaSetu** from **Demo Mode** into **Live Firebase Mode** (with real, syncing databases and user credentials), follow these instructions to set up your Firebase project.

---

## Step 1: Create a Firebase Project
1. Open the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add Project** (or *Create a project*).
3. Enter `SevaSetu` as the project name, accept the terms, and click **Continue**.
4. You can keep Google Analytics enabled or disable it (either works), then click **Create Project**.

---

## Step 2: Enable Firebase Authentication
SevaSetu uses email and password authentication to manage volunteers, restaurants, and NGOs.
1. In the left-hand sidebar, navigate to **Build** ➔ **Authentication**.
2. Click **Get Started**.
3. Under the **Sign-in method** tab, click **Email/Password**.
4. Enable the first toggle (**Email/Password**) and click **Save**.

---

## Step 3: Create the Firestore Database
Firestore acts as our NoSQL document database storing food pickups, cleanup campaigns, active SOS alerts, and points logs.
1. In the left-hand sidebar, navigate to **Build** ➔ **Firestore Database**.
2. Click **Create Database**.
3. Choose your database location (select a location closest to you, e.g., `asia-south1` for India/Bangalore). Click **Next**.
4. Select **Start in test mode** (this allows the client-side app to write and read data during development without strict security rules). Click **Create**.

> [!WARNING]
> **Production Rules:** Before launching the app in production, write Firestore security rules under the **Rules** tab in the Firebase Console to restrict unauthorized document alterations.

---

## Step 4: Register your Web App & Get API Keys
1. Click the **Project Overview** gear icon (⚙️) in the top-left sidebar and select **Project settings**.
2. Scroll down to the *Your apps* section at the bottom of the page and click the **Web icon ( `</>` )**.
3. Enter `SevaSetu Web` as the app nickname, and click **Register app**.
4. Firebase will display your `firebaseConfig` credentials object:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "sevasetu-xxxx.firebaseapp.com",
     projectId: "sevasetu-xxxx",
     storageBucket: "sevasetu-xxxx.appspot.com",
     messagingSenderId: "...",
     appId: "..."
   };
   ```

---

## Step 5: Configure your Local Environment Variables
We use Vite environment variables so that your secrets are never committed to your public GitHub repository.

1. Create a new file named **`.env.local`** at the root of your `SevaSetu` folder.
2. Open the file and populate it with your Firebase configuration values like this:
   ```env
   VITE_FIREBASE_API_KEY=paste_your_apiKey_here
   VITE_FIREBASE_AUTH_DOMAIN=paste_your_authDomain_here
   VITE_FIREBASE_PROJECT_ID=paste_your_projectId_here
   VITE_FIREBASE_STORAGE_BUCKET=paste_your_storageBucket_here
   VITE_FIREBASE_MESSAGING_SENDER_ID=paste_your_messagingSenderId_here
   VITE_FIREBASE_APP_ID=paste_your_appId_here
   ```
3. Save the file.

---

## Step 6: Verify Connections
1. Restart your local Vite dev server:
   ```bash
   npm run dev
   ```
2. Open the site in your browser.
3. Look at the bottom-left corner of the screen. The indicator should now read:
   🟢 **Live Firebase Mode**
4. All signups, food posts, SOS broadcasts, and reward redemptions will now write directly to your live Cloud Firestore database!
