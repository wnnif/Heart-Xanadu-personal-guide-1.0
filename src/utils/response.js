export function ok(data = {}) { return data; }
export function fail(reply, status, error) { reply.code(status); return { error }; }
