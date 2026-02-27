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

/**
 * Acquire a Graph API access token silently, falling back to popup.
 */
export async function acquireToken() {
    const msal = getMsalInstance()
    if (!msal) throw new Error('MSAL not configured. Set VITE_GRAPH_CLIENT_ID and VITE_GRAPH_TENANT_ID.')

    await msal.initialize()

    const accounts = msal.getAllAccounts()
    const request = { scopes: GRAPH_SCOPES, account: accounts[0] }

    try {
        const result = await msal.acquireTokenSilent(request)
        return result.accessToken
    } catch (err) {
        if (err instanceof InteractionRequiredAuthError) {
            // Silent failed — fallback to popup
            const result = await msal.acquireTokenPopup({ scopes: GRAPH_SCOPES })
            return result.accessToken
        }
        throw err
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
