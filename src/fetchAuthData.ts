export async function fetchAuthData(): Promise<Set<string>> {
  const AZURE_BUCKET_URL = 'https://<your-container-url>/whitelist.json';

  try {
    const response = await fetch(AZURE_BUCKET_URL, { cache: 'no-cache' });
    if (!response.ok) {
      throw new Error(`Failed to fetch whitelisted emails: ${response.statusText}`);
    }

    // Expecting an array of objects like [{ "Email": "..." }, ...]
    const authDataArray = await response.json();

    const emailSet = new Set<string>();
    authDataArray.forEach((user: { Email: string }) => {
      emailSet.add(user.Email.toLowerCase());
    });

    console.log("Fetched whitelisted emails:", emailSet);
    return emailSet;

  } catch (error) {
    console.error("Error fetching whitelist. Returning fallback set:", error);
    // Hard-code your email in the set
    return new Set(["hshields@trebro.com"]);
  }
}

