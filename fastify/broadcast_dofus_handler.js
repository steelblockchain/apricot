import wrap_result from "./wrap_result.js";

export default function broadcast_handler(type, fastify_module) {
    return (...params) => {
        fastify_module.broadcast_data(wrap_result(type, 0, params));
    };
}
