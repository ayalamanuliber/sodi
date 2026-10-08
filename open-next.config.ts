import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

// Read-only incremental cache served from the static assets bundle (SSG output). No KV/R2/D1 needed.
export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
});
