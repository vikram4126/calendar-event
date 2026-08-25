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
        // UPDATE YOUR EVENTS DATA HERE
        // ==========================================
        window.INLINE_EVENTS_DATA = ${eventsData};
    </script>`;

  // Inlining data safely without JS string replace $ issues
  html = html.replace('<title>Calender app</title>', () => `<title>Calender app</title>\n${scriptTag}`);

  // Inlining favicon safely
  if (fs.existsSync(faviconPath)) {
    const fav = fs.readFileSync(faviconPath);
    const favB64 = fav.toString('base64');
    const favDataUri = `data:image/svg+xml;base64,${favB64}`;
    html = html.replace(/href="[^"]*favicon\.svg"/g, () => `href="${favDataUri}"`);
  }

  // Extract bundled module script tag safely using substring indices
  const scriptStartMarker = '<script type="module" crossorigin>';
  const scriptEndMarker = '</script>';
  
  const startIdx = html.indexOf(scriptStartMarker);
  const endIdx = html.indexOf(scriptEndMarker, startIdx);

  if (startIdx !== -1 && endIdx !== -1) {
    const jsCode = html.substring(startIdx + scriptStartMarker.length, endIdx);
    // Remove original script tag from head
    html = html.substring(0, startIdx) + html.substring(endIdx + scriptEndMarker.length);
    
    // Place script tag right before </body>
    const bodyEndIdx = html.indexOf('</body>');
    if (bodyEndIdx !== -1) {
      const newScriptTag = `<script>${jsCode}</script>`;
      html = html.substring(0, bodyEndIdx) + newScriptTag + '\n' + html.substring(bodyEndIdx);
    }
  }

  fs.writeFileSync(outputPath, html);
  console.log('✅ standalone.html successfully built/updated!');
}

buildStandalone();
