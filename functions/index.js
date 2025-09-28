const doh = 'https://security.cloudflare-dns.com/dns-query';
const contype = 'application/dns-message';

export const onRequestGet = async ({ request }) => {
  const { headers, url } = request;
  const searchParams = new URL(url).searchParams;

  // Handle standard DoH GET with name and type parameters
  if (headers.get('Accept') === contype && searchParams.has('name') && searchParams.has('type')) {
    const name = searchParams.get('name');
    const type = searchParams.get('type');
    const query = `?name=${encodeURIComponent(name)}&type=${encodeURIComponent(type)}`;
    return await fetch(`${doh}${query}`, {
      method: 'GET',
      headers: {
        'Accept': contype,
      },
    });
  }

  // Fallback for other GET cases (e.g., ?dns=)
  if (searchParams.has('dns')) {
    return await fetch(`${doh}?dns=${searchParams.get('dns')}`, {
      method: 'GET',
      headers: {
        'Accept': contype,
      },
    });
  }

  // Default 404 for unmatched GET requests
  return new Response('test', { status: 404 });
};

export const onRequestPost = async ({ request }) => {
  const { headers } = request;
  if (headers.get('content-type') === contype) {
    return fetch(doh, {
      method: 'POST',
      headers: {
        'Accept': contype,
        'Content-Type': contype,
      },
      body: request.body,
    });
  }
  return new Response('', { status: 404 });
};
