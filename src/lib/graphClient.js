import { PublicClientApplication, InteractionRequiredAuthError } from '@azure/msal-browser'

const clientId = import.meta.env.VITE_GRAPH_CLIENT_ID || ''
const tenantId = import.meta.env.VITE_GRAPH_TENANT_ID || ''

export const isMsalConfigured = Boolean(clientId && tenantId)

// MSAL config
const msalConfig = {
    auth: {
        clientId,
        authority: `https://login.microsoftonline.com/${tenantId}`,
        redirectUri: window.location.origin,
    },
    cache: {
        cacheLocation: 'sessionStorage',
        storeAuthStateInCookie: false,
    },
}

// Required Graph API scopes for SharePoint list read
export const GRAPH_SCOPES = [
    'Sites.Read.All',
    'Sites.ReadWrite.All',
]

let _msalInstance = null

export function getMsalInstance() {
    if (!isMsalConfigured) return null
    if (!_msalInstance) {
        _msalInstance = new PublicClientApplication(msalConfig)
    }
    return _msalInstance
}

export async function acquireToken() {
    const msal = getMsalInstance()
    if (!msal) throw new Error('MSAL not configured. Set VITE_GRAPH_CLIENT_ID and VITE_GRAPH_TENANT_ID.')

    await msal.initialize()

    const accounts = msal.getAllAccounts()
    const request = { scopes: GRAPH_SCOPES, account: accounts[0] }

    try {
        if (!accounts || accounts.length === 0) {
            // No account found, trigger popup immediately
            throw new Error("no_account")
        }
        const result = await msal.acquireTokenSilent(request)
        return result.accessToken
    } catch (err) {
        // If MSAL gets stuck in 'interaction_in_progress', clear the cache so it can recover
        if (err.errorCode === 'interaction_in_progress') {
            console.warn("MSAL interaction stuck. Clearing session storage and retrying...")
            sessionStorage.clear()
        }

        // Fall back to popup if silent acquisition fails for ANY reason (no account, interaction required, etc)
        console.log("Silent token acquisition failed, attempting popup...", err)
        const result = await msal.acquireTokenPopup({ scopes: GRAPH_SCOPES })
        return result.accessToken
    }
}

/**
 * Generic Graph API GET helper.
 */
export async function graphGet(path) {
    const token = await acquireToken()
    const res = await fetch(`https://graph.microsoft.com/v1.0${path}`, {
        headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) {
        const body = await res.text()
        throw new Error(`Graph API error ${res.status}: ${body}`)
    }
    return res.json()
}
