const isPlainObject = (value) => Object.prototype.toString.call(value) === '[object Object]';

const safeStringify = (value) => {
    try {
        return JSON.stringify(value);
    } catch {
        return 'An unexpected error occurred';
    }
};

const toErrorMessage = (raw) => {
    if (typeof raw === 'string' && raw.trim()) return raw;

    if (Array.isArray(raw) && raw.length > 0) {
        const first = raw[0];
        if (typeof first === 'string') return first;
        if (first && typeof first.message === 'string') return first.message;
        return safeStringify(raw);
    }

    if (raw && typeof raw === 'object') {
        if (typeof raw.message === 'string' && raw.message.trim()) return raw.message;
        if (typeof raw.error === 'string' && raw.error.trim()) return raw.error;
        if (Array.isArray(raw.errors) && raw.errors[0]?.message) return raw.errors[0].message;
        if (Array.isArray(raw.issues) && raw.issues[0]?.message) return raw.issues[0].message;
        return safeStringify(raw);
    }

    return 'An unexpected error occurred';
};

module.exports = (req, res, next) => {
    const originalJson = res.json.bind(res);

    res.json = (body) => {
        const code = res.statusCode || 200;

        if (body === null || body === undefined) {
            return originalJson(body);
        }

        if (code >= 400) {
            return originalJson({
                success: false,
                error: toErrorMessage(body),
                code,
            });
        }

        return originalJson(body);
    };

    next();
};