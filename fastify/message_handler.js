import wrap_result from "./wrap_result.js";

export default function message_handler(app) {
    return (client, message) => {
        const send_client = (type, code, payload) => {
            client.socket.send(
                JSON.stringify(wrap_result(type, code, payload))
            );
        };

        switch (message.type) {
            case "list":
                const output = {};
                const modules = app.current_modules();
                for (const module_name of modules) {
                    const module = app.has_module(module_name);
                    if (module) {
                        output[module_name] = Object.getOwnPropertyNames(
                            Object.getPrototypeOf(module)
                        ).filter((key) => module[key]?.ws_api);
                    }
                }
                send_client("module:list", 0, {
                    input: null,
                    output,
                });
                break;
            case "execute":
                const module = app.has_module(message.module);
                if (module) {
                    if (
                        module[message.action] &&
                        module[message.action].ws_api
                    ) {
                        try {
                            const output = module[message.action](
                                message.params ?? {}
                            );

                            send_client("module:execute", 0, {
                                input: {
                                    module: message.module,
                                    action: message.action,
                                    params: message.params,
                                },
                                output: output ?? null,
                            });
                        } catch (e) {
                            send_client("module:execute", 1, {
                                input: {
                                    module: message.module,
                                    action: message.action,
                                    params: message.params,
                                },
                                output: e.toString(),
                            });
                        }
                    } else {
                        send_client("module:execute", 1, {
                            input: {
                                module: message.module,
                                action: message.action,
                                params: message.params,
                            },
                            output: `Error: action "${message.action}" not found in module "${message.module}"`,
                        });
                    }
                } else {
                    send_client("module:execute", 1, {
                        input: {
                            module: message.module,
                            action: message.action,
                            params: message.params,
                        },
                        output: `Error: module "${message.module}" not found`,
                    });
                }
                break;
            default:
                send_client(`module:${message.type}`, 1, {
                    output: `Error: type "${message.type}" not implemented`,
                });
                break;
        }
    };
}
