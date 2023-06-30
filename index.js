import {
    Fastify as fapp,
    MITM as mitm,
    Botofu as botofu,
    Dofus as dofus,
} from "abricot";

import fastify_message_handler from "./fastify/message_handler.js";
import fastify_broadcast_mitm_handler from "./fastify/broadcast_mitm_handler.js";
import fastify_broadcast_botofu_handler from "./fastify/broadcast_botofu_handler.js";
import fastify_broadcast_dofus_handler from "./fastify/broadcast_dofus_handler.js";

const main = async () => {
    const app = new fapp.FastifyApp({}, {}, "./config.yaml");

    const fastify_module = app.import_module(
        "fastify-module",
        fapp.FastifyModule,
        app.fastify
    );

    const mitm_module = app.import_module("mitm-module", mitm.MITMModule);

    const botofu_module = app.import_module(
        "botofu-module",
        botofu.BotofuModule
    );

    const dofus_module = app.import_module(
        "dofus-module",
        dofus.DofusModule,
        (path) => botofu_module.get_loader(path)
    );

    fastify_module.addListener(
        "onClientMessageJSON",
        fastify_message_handler(app)
    );

    mitm_module.addListener(
        "onScannerCreate",
        fastify_broadcast_mitm_handler("mitm:create", fastify_module)
    );

    mitm_module.addListener(
        "onScannerConnect",
        fastify_broadcast_mitm_handler("mitm:connect", fastify_module)
    );

    mitm_module.addListener(
        "onScannerSend",
        fastify_broadcast_mitm_handler("mitm:send", fastify_module)
    );

    mitm_module.addListener(
        "onScannerRecv",
        fastify_broadcast_mitm_handler("mitm:recv", fastify_module)
    );

    botofu_module.addListener(
        "onParsed",
        fastify_broadcast_botofu_handler("botofu:parse", fastify_module)
    );

    dofus_module.addListener(
        "onDofusPackets",
        fastify_broadcast_dofus_handler("dofus:packet", fastify_module)
    );

    dofus_module.addListener(
        "onDofusMessage",
        fastify_broadcast_dofus_handler("dofus:message", fastify_module)
    );

    await app.start();
};

main();
