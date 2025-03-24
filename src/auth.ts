// auth.ts
import { fetchAuthData } from './fetchAuthData';

// Keep a local array for whitelisted emails, if you want to enforce it in setUserData:
let whitelistedEmails: string[] = [];

/**
 * Attempt to load "Email -> Something" from your blob,
 * then store just the keys (emails) as whitelistedEmails.
 * Adjust as needed for your actual blob structure.
 */
(async () => {
  // If your blob returns valid JSON like:
  // [
  //   { "Email": "someone@example.com" },
  //   { "Email": "another@example.com" }
  // ]
  // Then fetchAuthData() might build a map { "someone@example.com": "..." }
  // or a set. Here we assume it’s a map of email->anyValue.
  const emailPasswordMap = await fetchAuthData();
  whitelistedEmails = Object.keys(emailPasswordMap); 
})();

const shouldAuthenticate = true;

/**
 * Helper to read a cookie by name. Returns `null` if not found.
 */
function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

class Auth {
  /**
   * Determines if the user is authenticated by checking
   * for an "auth" cookie set by your magic-link confirm function.
   */
  async isAuthenticated(): Promise<boolean> {
    if (!shouldAuthenticate) {
      return true; // If shouldAuthenticate is false, always "logged in"
    }

    const cookieVal = getCookie('auth');
    // If `auth` cookie is present, we consider the user authenticated
    return !!cookieVal;
  }

  /**
   * Called when the user enters an email in the login dialog
   * and clicks "Send Magic Link". Optionally enforces a whitelist check.
   *
   * - No password logic needed, because magic link flow handles that.
   * - If you want zero whitelisting, remove the 'if (!whitelistedEmails.includes...)' check.
   */
  async setUserData(userData: Record<string, any>) {
    const emailLower = userData.email.toLowerCase();

    // Optional: If you want to ensure user’s email is whitelisted
    // If not found, throw an error that triggers "Please request access."
    if (!whitelistedEmails.includes(emailLower)) {
      throw new Error('Email not registered. Please request access.');
    }

    // No password check needed—magic link handles that
    window.localStorage.zeaUserData = JSON.stringify({
      email: emailLower
      // no password needed
    });
  }

  /**
   * Retrieve the stored user data (currently just an email) from localStorage.
   * Does NOT confirm if the user is actually logged in—that’s done by isAuthenticated().
   */
  async getUserData(): Promise<Record<string, any> | null> {
    const { zeaUserData } = window.localStorage;
    return zeaUserData ? JSON.parse(zeaUserData) : null;
  }

  /**
   * Logs the user out by clearing localStorage and the "auth" cookie.
   * Future calls to isAuthenticated() should return false until they re-auth.
   */
  async signOut() {
    localStorage.removeItem('zeaUserData');
    // Clear the "auth" cookie
    document.cookie = "auth=; Path=/; Max-Age=0";
  }
}

const auth = new Auth();
export default auth;
export { auth, shouldAuthenticate };
