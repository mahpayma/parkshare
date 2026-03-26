/**
 * In production, this should call actual relay hardware (or edge gateway)
 * through a private network endpoint. URLs/tokens must stay server-side.
 */
export async function triggerRelay(door) {
  if (!door.relay_url) {
    throw new Error('Door relay URL is not configured');
  }

  // Placeholder for hardware relay integration.
  // Example (do not expose outside backend):
  // await fetch(door.relay_url, { method: 'POST', headers: { Authorization: `Bearer ${door.relay_token}` } });
  return {
    success: true,
    provider: 'mock-relay',
    relayUrlMasked: `${door.relay_url.slice(0, 16)}...`
  };
}
