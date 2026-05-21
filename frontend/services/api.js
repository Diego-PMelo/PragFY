const API_BASE = 'http://localhost:8080/api';

const api = {
  async request(method, path, body) {
    const opts = { method, headers: { 'Content-Type': 'application/json' } };
    if (body !== undefined) opts.body = JSON.stringify(body);
    const res = await fetch(API_BASE + path, opts);
    if (res.status === 204) return null;
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },
  get:  (path)       => api.request('GET',    path),
  post: (path, body) => api.request('POST',   path, body),
  put:  (path, body) => api.request('PUT',    path, body),
  del:  (path)       => api.request('DELETE', path),
};
