import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = __dirname;

function buildStandalone() {
  const eventsDataPath = path.join(root, 'public', 'events.json');
  const distHtmlPath = path.join(root, 'dist', 'index.html');
  const faviconPath = path.join(root, 'public', 'favicon.svg');
  const outputPath = path.join(root, 'standalone.html');

  if (!fs.existsSync(eventsDataPath)) {
    console.error('Error: public/events.json not found!');
    process.exit(1);
  }

  if (!fs.existsSync(distHtmlPath)) {
    console.error('Error: dist/index.html not found! Run `vite build` first.');
    process.exit(1);
  }

  const eventsData = fs.readFileSync(eventsDataPath, 'utf-8');
  let html = fs.readFileSync(distHtmlPath, 'utf-8');

  const scriptTag = `<script>
        // ==========================================
        // INLINE EVENTS DATA
        // ==========================================
        window.INLINE_EVENTS_DATA = ${eventsData};
    </script>`;

  let finalHtml = html.replace('<title>temp-app</title>', `<title>temp-app</title>\n${scriptTag}`);

  if (fs.existsSync(faviconPath)) {
    const fav = fs.readFileSync(faviconPath);
    const favB64 = fav.toString('base64');
    const favDataUri = `data:image/svg+xml;base64,${favB64}`;
    finalHtml = finalHtml.replace(/href="[^"]*favicon\.svg"/g, `href="${favDataUri}"`);
  }

  const scriptMatch = finalHtml.match(/<script type="module" crossorigin>[\s\S]*?<\/script>/);
  if (scriptMatch) {
    const scriptContent = scriptMatch[0];
    finalHtml = finalHtml.replace(scriptContent, '');
    finalHtml = finalHtml.replace('</body>', scriptContent.replace('<script type="module" crossorigin>', '<script>') + '\n</body>');
  } else {
    finalHtml = finalHtml.replace('<script type="module" crossorigin>', '<script>');
  }

  fs.writeFileSync(outputPath, finalHtml);
  console.log('✅ standalone.html successfully built/updated with latest public/events.json!');
}

buildStandalone();
