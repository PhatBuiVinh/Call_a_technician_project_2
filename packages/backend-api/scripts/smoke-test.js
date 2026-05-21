#!/usr/bin/env node

const baseUrl = (process.env.SMOKE_BASE_URL || 'http://localhost:5000').replace(/\/$/, '');
const healthUrl = `${baseUrl}/api/health`;

async function main() {
  if (typeof fetch !== 'function') {
    console.error('Smoke test requires a Node.js runtime with global fetch support.');
    process.exit(1);
  }

  let response;
  try {
    response = await fetch(healthUrl, {
      method: 'GET',
      headers: {
        accept: 'application/json',
      },
    });
  } catch (error) {
    console.error(`Backend smoke test failed: unable to reach ${healthUrl}`);
    console.error(error?.message || error);
    process.exit(1);
  }

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    console.error(`Backend smoke test failed: ${healthUrl} returned ${response.status} ${response.statusText}`);
    if (body) {
      console.error(body);
    }
    process.exit(1);
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!payload || payload.ok !== true) {
    console.error(`Backend smoke test failed: unexpected response from ${healthUrl}`);
    console.error(payload ?? '<no JSON body>');
    process.exit(1);
  }

  console.log(`Backend smoke test passed: ${healthUrl}`);
}

main().catch((error) => {
  console.error('Backend smoke test failed unexpectedly.');
  console.error(error?.message || error);
  process.exit(1);
});