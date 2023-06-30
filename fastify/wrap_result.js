export default function wrap_result(type, code, payload) {
    return {
        type,
        code,
        payload,
    };
}
