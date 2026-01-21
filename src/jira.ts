
const JIRA_URL = process.env.JIRA_URL || "";
const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN || "";

// Disable SSL verification for self-signed certificates (common in internal Jira)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

/**
 * Helper to get the base URL for Jira API.
 * Handles the case where the user might have a context path like /jira.
 * We want to ensure we are hitting the REST API endpoint.
 * Based on previous exploration, the user's Jira is at $JIRA_URL/jira
 */
function getJiraApiUrl(endpoint: string): string {
    // Remove trailing slash from base URL
    let baseUrl = JIRA_URL.replace(/\/$/, "");

    // If the base URL doesn't already end in /jira, and the user's setup requires it, 
    // we might need to append it. However, the env var provided by the user is likely
    // the base server URL (https://jira.tc-gaming.co).
    // The correct API path we found was /jira/rest/api/2/...

    // Check if we need to append /jira. 
    // We'll trust the logic that worked: ${JIRA_URL}/jira/rest/api/2/...
    // But we should be careful not to double it if JIRA_URL already includes it.
    if (!baseUrl.endsWith("/jira")) {
        baseUrl = `${baseUrl}/jira`;
    }

    // Ensure endpoint starts with /
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

    return `${baseUrl}/rest/api/2${cleanEndpoint}`;
}

const commonHeaders = {
    "Authorization": `Bearer ${JIRA_API_TOKEN}`,
    "Content-Type": "application/json",
    "Accept": "application/json"
};

export async function searchJiraIssues(jql: string, maxResults: number = 20) {
    if (!JIRA_URL || !JIRA_API_TOKEN) {
        throw new Error("JIRA_URL and JIRA_API_TOKEN environment variables are required.");
    }

    const url = new URL(getJiraApiUrl("/search"));
    url.searchParams.append("jql", jql);
    url.searchParams.append("maxResults", maxResults.toString());
    url.searchParams.append("fields", "key,summary,status");

    console.error(`[Jira] Searching: ${url.toString()}`);

    const response = await fetch(url.toString(), {
        method: "GET",
        headers: commonHeaders
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Jira API Error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    return data;
}

export async function getJiraIssue(issueKey: string) {
    if (!JIRA_URL || !JIRA_API_TOKEN) {
        throw new Error("JIRA_URL and JIRA_API_TOKEN environment variables are required.");
    }

    const url = getJiraApiUrl(`/issue/${issueKey}`);
    console.error(`[Jira] Getting Issue: ${url}`);

    const response = await fetch(url, {
        method: "GET",
        headers: commonHeaders
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Jira API Error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    return data;
}
