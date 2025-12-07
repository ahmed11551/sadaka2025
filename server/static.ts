import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  // In production build, we need to resolve the path correctly
  // When bundled with esbuild, __dirname may not work as expected
  // Try multiple possible paths
  let distPath: string;
  
  // Try different possible paths
  const possiblePaths = [
    path.resolve(__dirname, "public"),              // Relative to compiled file
    path.resolve(process.cwd(), "dist", "public"),  // Relative to working directory
    path.resolve("/app/dist/public"),                // Absolute path in Docker
    path.join(process.cwd(), "dist", "public"),     // Alternative join
  ];
  
  for (const testPath of possiblePaths) {
    if (fs.existsSync(testPath) && fs.existsSync(path.join(testPath, "index.html"))) {
      distPath = testPath;
      console.log(`[static] Serving static files from: ${distPath}`);
      break;
    }
  }
  
  if (!distPath) {
    const errorMsg = `Could not find the build directory. Tried: ${possiblePaths.join(", ")}`;
    console.error(`[static] ${errorMsg}`);
    throw new Error(errorMsg);
  }
  
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  // Serve static files from dist/public (CSS, JS, images, etc.)
  app.use(express.static(distPath, {
    index: false, // Don't serve index.html for directory requests
    maxAge: '1y', // Cache static assets for 1 year
  }));

  // SPA fallback: serve index.html for all non-API routes
  // This must be last to catch all routes not handled above
  app.use((req, res, next) => {
    // Skip API routes - they should be handled by routes middleware
    if (req.path.startsWith("/api")) {
      return next();
    }
    
    // Skip static file extensions (already handled by express.static)
    const hasExtension = /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|json|xml|txt|map)$/i.test(req.path);
    if (hasExtension) {
      return next();
    }
    
    // Skip uploads directory
    if (req.path.startsWith("/uploads")) {
      return next();
    }
    
    // Skip Vite HMR
    if (req.path.startsWith("/vite-hmr")) {
      return next();
    }
    
    // Serve index.html for all other routes (SPA routing)
    const indexPath = path.resolve(distPath, "index.html");
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      next(new Error(`index.html not found at ${indexPath}`));
    }
  });
}
