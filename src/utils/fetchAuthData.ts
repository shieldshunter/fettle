export async function fetchAuthData(): Promise<Set<string>> {
  const AZURE_BUCKET_URL =
  'https://partsmanual.blob.core.windows.net/authenticationhash/credentials.json'
+ '?sv=2024-11-04&ss=bfqt&srt=sco&sp=rwdlacupiytfx&se=2026-12-13T00:40:19Z&st=2025-08-04T15:25:19Z&spr=https,http&sig=7LSdsX4SkTUHUfRuVEKC0MPln0K0G1kAhOY1v9bJUKs%3D';

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

