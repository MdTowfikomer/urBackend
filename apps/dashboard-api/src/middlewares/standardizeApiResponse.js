const isPlainObject = (value) => Object.prototype.toString.call(value) === '[object Object]';

const toErrorMessage = (raw) => {
    if (typeof raw === 'string' && raw.trim()) return raw;

    if (Array.isArray(raw) && raw.length > 0) {
        const first = raw[0];
        if (typeof first === 'string') return first;
        if (first && typeof first.message === 'string') return first.message;
        return JSON.stringify(raw);
    }

    if (raw && typeof raw === 'object') {
        if (typeof raw.message === 'string' && raw.message.trim()) return raw.message;
        if (Array.isArray(raw.errors) && raw.errors[0]?.message) return raw.errors[0].message;
        if (Array.isArray(raw.issues) && raw.issues[0]?.message) return raw.issues[0].message;
        return JSON.stringify(raw);
    }

    return 'An unexpected error occurred';
};

const normalizeSuccessBody = (body, code) => {
    if (isPlainObject(body) && body.success === true) {
        const { code: existingCode, ...rest } = body;
        return { success: true, code: existingCode || code, ...rest };
    }

    if (isPlainObject(body) && body.success === false) {
        const { code: existingCode, error } = body;
        return {
            success: false,
            error: toErrorMessage(error),
            code: existingCode || code,
        };
    }

    if (isPlainObject(body) && Object.keys(body).length === 1 && Object.prototype.hasOwnProperty.call(body, 'message')) {
        return { success: true, message: body.message, code };
    }

    return { success: true, data: body, code };
};

module.exports = (req, res, next) => {
    const originalJson = res.json.bind(res);

    res.json = (body) => {
        const code = res.statusCode || 200;

        if (body === null || body === undefined) {
            return originalJson(body);
        }

        if (code >= 400) {
            if (isPlainObject(body) && body.success === false && typeof body.code === 'number') {
                return originalJson(body);
            }

            const errorSource = isPlainObject(body) && Object.prototype.hasOwnProperty.call(body, 'error')
                ? body.error
                : body;

            return originalJson({
                success: false,
                error: toErrorMessage(errorSource),
                code,
            });
        }

        return originalJson(normalizeSuccessBody(body, code));
    };

    next();
};
