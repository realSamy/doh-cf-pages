const doh = 'https://security.cloudflare-dns.com/dns-query';
const contype = 'application/dns-message';

export default {
  async fetch(request) {
    const { method, headers, url } = request;
    const searchParams = new URL(url).searchParams;
    const pathname = new URL(url).pathname;

    // Only process /dns-query path
    if (pathname === '/dns-query') {
      if (method === 'GET' && headers.get('Accept') === contype && searchParams.has('name') && searchParams.has('type')) {
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

      if (method === 'POST' && headers.get('content-type') === contype) {
        return fetch(doh, {
          method: 'POST',
          headers: {
            'Accept': contype,
            'Content-Type': contype,
          },
          body: request.body,
        });
      }

      if (searchParams.has('dns')) {
        return await fetch(`${doh}?dns=${searchParams.get('dns')}`, {
          method: 'GET',
          headers: {
            'Accept': contype,
          },
        });
      }
    }

    // Default response for unmatched paths or methods
    return new Response('test', { status: 404 });
  },
};
