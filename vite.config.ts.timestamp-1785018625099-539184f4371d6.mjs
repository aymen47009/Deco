// vite.config.ts
import { defineConfig } from "file:///home/project/node_modules/vite/dist/node/index.js";
import react from "file:///home/project/node_modules/@vitejs/plugin-react/dist/index.js";
import path from "node:path";

// server/vite-plugin.js
import { spawn } from "node:child_process";
import net from "node:net";
function isPortOpen(port) {
  return new Promise((resolve) => {
    const sock = net.createConnection({ port });
    sock.once("connect", () => {
      sock.destroy();
      resolve(true);
    });
    sock.once("error", () => resolve(false));
  });
}
function startApiServer() {
  return {
    name: "start-api-server",
    configureServer(server) {
      const apiPort = 5050;
      const boot = async () => {
        const open = await isPortOpen(apiPort);
        if (open) {
          console.log(`[api] already running on :${apiPort}`);
          return;
        }
        console.log(`[api] starting Express on :${apiPort}`);
        const child = spawn("node", ["server/index.js"], {
          stdio: "inherit",
          env: { ...process.env, PORT: String(apiPort) }
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
            body: ["GET", "HEAD"].includes(req.method) ? void 0 : req,
            duplex: "half"
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
    }
  };
}

// vite.config.ts
var __vite_injected_original_dirname = "/home/project";
var vite_config_default = defineConfig({
  plugins: [react(), startApiServer()],
  resolve: {
    alias: { "@": path.resolve(__vite_injected_original_dirname, "./src") }
  },
  server: {
    port: 5173
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAic2VydmVyL3ZpdGUtcGx1Z2luLmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2hvbWUvcHJvamVjdFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2hvbWUvcHJvamVjdC92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3RcIjtcbmltcG9ydCBwYXRoIGZyb20gXCJub2RlOnBhdGhcIjtcbmltcG9ydCB7IHN0YXJ0QXBpU2VydmVyIH0gZnJvbSBcIi4vc2VydmVyL3ZpdGUtcGx1Z2luLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtyZWFjdCgpLCBzdGFydEFwaVNlcnZlcigpXSxcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7IFwiQFwiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4vc3JjXCIpIH0sXG4gIH0sXG4gIHNlcnZlcjoge1xuICAgIHBvcnQ6IDUxNzMsXG4gIH0sXG59KTtcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2hvbWUvcHJvamVjdC9zZXJ2ZXJcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL3Byb2plY3Qvc2VydmVyL3ZpdGUtcGx1Z2luLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvc2VydmVyL3ZpdGUtcGx1Z2luLmpzXCI7aW1wb3J0IHsgc3Bhd24gfSBmcm9tIFwibm9kZTpjaGlsZF9wcm9jZXNzXCI7XG5pbXBvcnQgbmV0IGZyb20gXCJub2RlOm5ldFwiO1xuXG5mdW5jdGlvbiBpc1BvcnRPcGVuKHBvcnQpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgY29uc3Qgc29jayA9IG5ldC5jcmVhdGVDb25uZWN0aW9uKHsgcG9ydCB9KTtcbiAgICBzb2NrLm9uY2UoXCJjb25uZWN0XCIsICgpID0+IHsgc29jay5kZXN0cm95KCk7IHJlc29sdmUodHJ1ZSk7IH0pO1xuICAgIHNvY2sub25jZShcImVycm9yXCIsICgpID0+IHJlc29sdmUoZmFsc2UpKTtcbiAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdGFydEFwaVNlcnZlcigpIHtcbiAgcmV0dXJuIHtcbiAgICBuYW1lOiBcInN0YXJ0LWFwaS1zZXJ2ZXJcIixcbiAgICBjb25maWd1cmVTZXJ2ZXIoc2VydmVyKSB7XG4gICAgICBjb25zdCBhcGlQb3J0ID0gNTA1MDsgLy8gZml4ZWQsIGluZGVwZW5kZW50IG9mIGhhcm5lc3MgUE9SVFxuXG4gICAgICBjb25zdCBib290ID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICBjb25zdCBvcGVuID0gYXdhaXQgaXNQb3J0T3BlbihhcGlQb3J0KTtcbiAgICAgICAgaWYgKG9wZW4pIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhgW2FwaV0gYWxyZWFkeSBydW5uaW5nIG9uIDoke2FwaVBvcnR9YCk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUubG9nKGBbYXBpXSBzdGFydGluZyBFeHByZXNzIG9uIDoke2FwaVBvcnR9YCk7XG4gICAgICAgIGNvbnN0IGNoaWxkID0gc3Bhd24oXCJub2RlXCIsIFtcInNlcnZlci9pbmRleC5qc1wiXSwge1xuICAgICAgICAgIHN0ZGlvOiBcImluaGVyaXRcIixcbiAgICAgICAgICBlbnY6IHsgLi4ucHJvY2Vzcy5lbnYsIFBPUlQ6IFN0cmluZyhhcGlQb3J0KSB9LFxuICAgICAgICB9KTtcbiAgICAgICAgY2hpbGQub24oXCJleGl0XCIsIChjb2RlKSA9PiBjb25zb2xlLmxvZyhgW2FwaV0gZXhpdGVkIHdpdGggJHtjb2RlfWApKTtcbiAgICAgIH07XG5cbiAgICAgIHNlcnZlci5taWRkbGV3YXJlcy51c2UoXCIvYXBpXCIsIGFzeW5jIChyZXEsIHJlcywgbmV4dCkgPT4ge1xuICAgICAgICBhd2FpdCBib290KCk7XG4gICAgICAgIGNvbnN0IHRhcmdldCA9IGBodHRwOi8vMTI3LjAuMC4xOiR7YXBpUG9ydH0ke3JlcS51cmx9YDtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zdCBwcm94eVJlcyA9IGF3YWl0IGZldGNoKHRhcmdldCwge1xuICAgICAgICAgICAgbWV0aG9kOiByZXEubWV0aG9kLFxuICAgICAgICAgICAgaGVhZGVyczogcmVxLmhlYWRlcnMsXG4gICAgICAgICAgICBib2R5OiBbXCJHRVRcIiwgXCJIRUFEXCJdLmluY2x1ZGVzKHJlcS5tZXRob2QpID8gdW5kZWZpbmVkIDogcmVxLFxuICAgICAgICAgICAgZHVwbGV4OiBcImhhbGZcIixcbiAgICAgICAgICB9KTtcbiAgICAgICAgICByZXMuc3RhdHVzQ29kZSA9IHByb3h5UmVzLnN0YXR1cztcbiAgICAgICAgICBwcm94eVJlcy5oZWFkZXJzLmZvckVhY2goKHYsIGspID0+IHJlcy5zZXRIZWFkZXIoaywgdikpO1xuICAgICAgICAgIGNvbnN0IGJ1ZiA9IEJ1ZmZlci5mcm9tKGF3YWl0IHByb3h5UmVzLmFycmF5QnVmZmVyKCkpO1xuICAgICAgICAgIHJlcy5lbmQoYnVmKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIHJlcy5zdGF0dXNDb2RlID0gNTAyO1xuICAgICAgICAgIHJlcy5zZXRIZWFkZXIoXCJjb250ZW50LXR5cGVcIiwgXCJhcHBsaWNhdGlvbi9qc29uXCIpO1xuICAgICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoeyBlcnJvcjogXCJBUEkgc2VydmVyIG5vdCByZWFkeTogXCIgKyBlLm1lc3NhZ2UgfSkpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgYm9vdCgpO1xuICAgIH0sXG4gIH07XG59XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXlOLFNBQVMsb0JBQW9CO0FBQ3RQLE9BQU8sV0FBVztBQUNsQixPQUFPLFVBQVU7OztBQ0Y2TixTQUFTLGFBQWE7QUFDcFEsT0FBTyxTQUFTO0FBRWhCLFNBQVMsV0FBVyxNQUFNO0FBQ3hCLFNBQU8sSUFBSSxRQUFRLENBQUMsWUFBWTtBQUM5QixVQUFNLE9BQU8sSUFBSSxpQkFBaUIsRUFBRSxLQUFLLENBQUM7QUFDMUMsU0FBSyxLQUFLLFdBQVcsTUFBTTtBQUFFLFdBQUssUUFBUTtBQUFHLGNBQVEsSUFBSTtBQUFBLElBQUcsQ0FBQztBQUM3RCxTQUFLLEtBQUssU0FBUyxNQUFNLFFBQVEsS0FBSyxDQUFDO0FBQUEsRUFDekMsQ0FBQztBQUNIO0FBRU8sU0FBUyxpQkFBaUI7QUFDL0IsU0FBTztBQUFBLElBQ0wsTUFBTTtBQUFBLElBQ04sZ0JBQWdCLFFBQVE7QUFDdEIsWUFBTSxVQUFVO0FBRWhCLFlBQU0sT0FBTyxZQUFZO0FBQ3ZCLGNBQU0sT0FBTyxNQUFNLFdBQVcsT0FBTztBQUNyQyxZQUFJLE1BQU07QUFDUixrQkFBUSxJQUFJLDZCQUE2QixPQUFPLEVBQUU7QUFDbEQ7QUFBQSxRQUNGO0FBQ0EsZ0JBQVEsSUFBSSw4QkFBOEIsT0FBTyxFQUFFO0FBQ25ELGNBQU0sUUFBUSxNQUFNLFFBQVEsQ0FBQyxpQkFBaUIsR0FBRztBQUFBLFVBQy9DLE9BQU87QUFBQSxVQUNQLEtBQUssRUFBRSxHQUFHLFFBQVEsS0FBSyxNQUFNLE9BQU8sT0FBTyxFQUFFO0FBQUEsUUFDL0MsQ0FBQztBQUNELGNBQU0sR0FBRyxRQUFRLENBQUMsU0FBUyxRQUFRLElBQUkscUJBQXFCLElBQUksRUFBRSxDQUFDO0FBQUEsTUFDckU7QUFFQSxhQUFPLFlBQVksSUFBSSxRQUFRLE9BQU8sS0FBSyxLQUFLLFNBQVM7QUFDdkQsY0FBTSxLQUFLO0FBQ1gsY0FBTSxTQUFTLG9CQUFvQixPQUFPLEdBQUcsSUFBSSxHQUFHO0FBQ3BELFlBQUk7QUFDRixnQkFBTSxXQUFXLE1BQU0sTUFBTSxRQUFRO0FBQUEsWUFDbkMsUUFBUSxJQUFJO0FBQUEsWUFDWixTQUFTLElBQUk7QUFBQSxZQUNiLE1BQU0sQ0FBQyxPQUFPLE1BQU0sRUFBRSxTQUFTLElBQUksTUFBTSxJQUFJLFNBQVk7QUFBQSxZQUN6RCxRQUFRO0FBQUEsVUFDVixDQUFDO0FBQ0QsY0FBSSxhQUFhLFNBQVM7QUFDMUIsbUJBQVMsUUFBUSxRQUFRLENBQUMsR0FBRyxNQUFNLElBQUksVUFBVSxHQUFHLENBQUMsQ0FBQztBQUN0RCxnQkFBTSxNQUFNLE9BQU8sS0FBSyxNQUFNLFNBQVMsWUFBWSxDQUFDO0FBQ3BELGNBQUksSUFBSSxHQUFHO0FBQUEsUUFDYixTQUFTLEdBQUc7QUFDVixjQUFJLGFBQWE7QUFDakIsY0FBSSxVQUFVLGdCQUFnQixrQkFBa0I7QUFDaEQsY0FBSSxJQUFJLEtBQUssVUFBVSxFQUFFLE9BQU8sMkJBQTJCLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFBQSxRQUN6RTtBQUFBLE1BQ0YsQ0FBQztBQUVELFdBQUs7QUFBQSxJQUNQO0FBQUEsRUFDRjtBQUNGOzs7QUR2REEsSUFBTSxtQ0FBbUM7QUFLekMsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUyxDQUFDLE1BQU0sR0FBRyxlQUFlLENBQUM7QUFBQSxFQUNuQyxTQUFTO0FBQUEsSUFDUCxPQUFPLEVBQUUsS0FBSyxLQUFLLFFBQVEsa0NBQVcsT0FBTyxFQUFFO0FBQUEsRUFDakQ7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxFQUNSO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
