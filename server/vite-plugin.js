import { spawn } from "node:child_process";
import net from "node:net";

function isPortOpen(port) {
  return new Promise((resolve) => {
    const sock = net.createConnection({ port });
    sock.once("connect", () => { sock.destroy(); resolve(true); });
    sock.once("error", () => resolve(false));
  });
}

export function startApiServer() {
  return {
    name: "start-api-server",
    configureServer(server) {
      const apiPort = 5050; // fixed, independent of harness PORT

      const boot = async () => {
        const open = await isPortOpen(apiPort);
        if (open) {
          console.log(`[api] already running on :${apiPort}`);
          return;
        }
        console.log(`[api] starting Express on :${apiPort}`);
        const child = spawn("node", ["server/index.js"], {
          stdio: "inherit",
          env: { ...process.env, PORT: String(apiPort) },
        });
        child.on("exit", (code) => console.log(`[api] exited with ${code}`));
      };

      server.middlewares.use("/api", async (req, res, next) => {
        await boot();
        const target = `http://127.0.0.1:${apiPort}${req.url}`;
        try {
          const proxyRes = await fetch(target, {
            method: req.method,
            headers: req.headers,
            body: ["GET", "HEAD"].includes(req.method) ? undefined : req,
            duplex: "half",
          });
          res.statusCode = proxyRes.status;
          proxyRes.headers.forEach((v, k) => res.setHeader(k, v));
          const buf = Buffer.from(await proxyRes.arrayBuffer());
          res.end(buf);
        } catch (e) {
          res.statusCode = 502;
          res.setHeader("content-type", "application/json");
          res.end(JSON.stringify({ error: "API server not ready: " + e.message }));
        }
      });

      boot();
    },
  };
}
