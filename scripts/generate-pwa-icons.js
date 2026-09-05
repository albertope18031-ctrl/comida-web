const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ICONS_DIR = path.join(__dirname, '..', 'public', 'icons');

if (!fs.existsSync(ICONS_DIR)) {
  fs.mkdirSync(ICONS_DIR, { recursive: true });
}

// SVG with high contrast brand aesthetic: emerald green background, gold wings/flame emblem, and clean typography
const generateSvg = (size, isMaskable = false) => {
  const padding = isMaskable ? Math.round(size * 0.2) : Math.round(size * 0.08);
  const innerSize = size - padding * 2;
  const radius = isMaskable ? 0 : Math.round(size * 0.22);

  return `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#005A36" />
      <stop offset="100%" stop-color="#003520" />
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFE066" />
      <stop offset="50%" stop-color="#FFC72C" />
      <stop offset="100%" stop-color="#D99B00" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.4"/>
    </filter>
  </defs>

  <!-- Background tile -->
  <rect width="${size}" height="${size}" rx="${radius}" fill="url(#bgGrad)" />

  <!-- Inner circular ring accent -->
  <circle cx="${size / 2}" cy="${size / 2}" r="${innerSize * 0.44}" fill="none" stroke="url(#goldGrad)" stroke-width="${Math.max(2, Math.round(size * 0.02))}" opacity="0.4" />

  <!-- Center Wing / Flame Emblem -->
  <g transform="translate(${size / 2}, ${size / 2 * 0.85}) scale(${size / 192})" filter="url(#glow)">
    <!-- Stylized Wings -->
    <path d="M-42,-8 C-30,-28 -5,-32 0,-15 C5,-32 30,-28 42,-8 C34,16 10,25 0,38 C-10,25 -34,16 -42,-8 Z" fill="url(#goldGrad)" />
    <!-- Flame / Flavor Core -->
    <path d="M-12,2 C-18,-10 -6,-22 0,-26 C6,-22 18,-10 12,2 C9,8 0,16 0,16 C0,16 -9,8 -12,2 Z" fill="#E11D48" />
  </g>

  <!-- Brand Typography -->
  <text 
    x="${size / 2}" 
    y="${size * 0.78}" 
    font-family="system-ui, -apple-system, sans-serif" 
    font-size="${Math.round(size * 0.12)}" 
    font-weight="900" 
    letter-spacing="${Math.round(size * 0.015)}"
    text-anchor="middle" 
    fill="#FFFFFF"
    filter="url(#glow)"
  >
    COMIDA
  </text>
  <text 
    x="${size / 2}" 
    y="${size * 0.88}" 
    font-family="system-ui, -apple-system, sans-serif" 
    font-size="${Math.round(size * 0.065)}" 
    font-weight="800" 
    letter-spacing="${Math.round(size * 0.02)}"
    text-anchor="middle" 
    fill="#FFC72C"
  >
    WINGS &amp; BONELESS
  </text>
</svg>
`;
};

async function generateIcons() {
  console.log('Generando iconos PWA...');

  const iconConfigs = [
    { name: 'icon-192x192.png', size: 192, maskable: false },
    { name: 'icon-512x512.png', size: 512, maskable: false },
    { name: 'icon-maskable-512x512.png', size: 512, maskable: true },
    { name: 'apple-touch-icon.png', size: 180, maskable: false },
    { name: 'favicon-32x32.png', size: 32, maskable: false },
  ];

  for (const config of iconConfigs) {
    const svgBuffer = Buffer.from(generateSvg(config.size, config.maskable));
    const targetPath = path.join(ICONS_DIR, config.name);
    
    await sharp(svgBuffer)
      .resize(config.size, config.size)
      .png()
      .toFile(targetPath);

    console.log(`✓ Icono creado: ${config.name} (${config.size}x${config.size})`);
  }

  // Also write an icon.png directly in public/ for fallback
  const fallbackPath = path.join(__dirname, '..', 'public', 'apple-touch-icon.png');
  fs.copyFileSync(path.join(ICONS_DIR, 'apple-touch-icon.png'), fallbackPath);

  console.log('✓ Todos los iconos PWA se generaron exitosamente.');
}

generateIcons().catch((err) => {
  console.error('Error generando iconos:', err);
  process.exit(1);
});
