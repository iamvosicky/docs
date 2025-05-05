// This file configures how Cloudflare Pages serves your Next.js application
export default {
  async fetch(request, env, ctx) {
    // The asset handler serves all static assets from the build output
    const assetHandler = await import('/__next-on-pages-handler__/assets');
    // The default handler serves your SSR pages and API routes
    const defaultHandler = await import('/__next-on-pages-handler__/default');
    
    // Get the URL from the request
    const url = new URL(request.url);
    
    // If the request is for a static asset, use the asset handler
    if (/\.(js|css|jpe?g|png|gif|svg|ico|webp|woff2?)$/i.test(url.pathname)) {
      return assetHandler.default(request, env, ctx);
    }
    
    // Otherwise, use the default handler for SSR pages and API routes
    return defaultHandler.default(request, env, ctx);
  }
};
