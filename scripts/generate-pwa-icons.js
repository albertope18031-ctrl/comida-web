const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ICONS_DIR = path.join(__dirname, '..', 'public', 'icons');

if (!fs.existsSync(ICONS_DIR)) {
  fs.mkdirSync(ICONS_DIR, { recursive: true });
}

// SVG con identidad oficial LOCO ROOSTER: Fondo Carbón Ahumado #1C1917, Amarillo Queso #FFB703 y Rojo Salsa #FF3823
const generateSvg = (size, isMaskable = false) => {
  const padding = isMaskable ? Math.round(size * 0.18) : Math.round(size * 0.08);
  const innerSize = size - padding * 2;
  const radius = isMaskable ? 0 : Math.round(size * 0.22);

  return `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1C1917" />
      <stop offset="100%" stop-color="#12100E" />
    </linearGradient>
    <linearGradient id="yellowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFE066" />
      <stop offset="50%" stop-color="#FFB703" />
      <stop offset="100%" stop-color="#E5A400" />
    </linearGradient>
    <linearGradient id="redGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF5A47" />
      <stop offset="50%" stop-color="#FF3823" />
      <stop offset="100%" stop-color="#D9230F" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.5"/>
    </filter>
  </defs>

  <!-- Fondo Carbón -->
  <rect width="${size}" height="${size}" rx="${radius}" fill="url(#bgGrad)" />

  <!-- Anillo Amarillo Queso Cheddar -->
  <circle cx="${size / 2}" cy="${size / 2}" r="${innerSize * 0.44}" fill="none" stroke="url(#yellowGrad)" stroke-width="${Math.max(2, Math.round(size * 0.025))}" opacity="0.6" />

  <!-- Cresta y Pico del Gallo Rooster -->
  <g transform="translate(${size / 2}, ${size / 2 * 0.82}) scale(${size / 192})" filter="url(#glow)">
    <!-- Cresta Roja -->
    <path d="M-20,-24 C-25,-38 -10,-45 -4,-35 C2,-46 16,-42 12,-30 C22,-36 30,-26 22,-16 C30,-12 28,2 18,2 L-18,2 C-26,-4 -28,-16 -20,-24 Z" fill="url(#redGrad)" />
    <!-- Cabeza y Plumaje Amarillo -->
    <path d="M-22,2 C-26,12 -18,28 0,32 C18,28 26,12 22,2 Z" fill="url(#yellowGrad)" />
    <!-- Pico y Barba -->
    <path d="M-4,12 L14,18 L-4,24 Z" fill="#FF3823" />
    <!-- Ojo Loco -->
    <circle cx="-6" cy="10" r="4" fill="#1C1917" />
    <circle cx="-5" cy="9" r="1.5" fill="#FFFFFF" />
  </g>

  <!-- Tipografía Oficial LOCO ROOSTER -->
  <text 
    x="${size / 2}" 
    y="${size * 0.80}" 
    font-family="system-ui, -apple-system, sans-serif" 
    font-size="${Math.round(size * 0.105)}" 
    font-weight="900" 
    letter-spacing="${Math.round(size * 0.012)}"
    text-anchor="middle" 
    fill="#FFFFFF"
    filter="url(#glow)"
  >
    LOCO ROOSTER
  </text>
  <text 
    x="${size / 2}" 
    y="${size * 0.90}" 
    font-family="system-ui, -apple-system, sans-serif" 
    font-size="${Math.round(size * 0.06)}" 
    font-weight="800" 
    letter-spacing="${Math.round(size * 0.025)}"
    text-anchor="middle" 
    fill="#FFB703"
  >
    MONCHOS DE VERDAD
  </text>
</svg>
`;
};

async function generateIcons() {
  console.log('Generando iconos PWA para LOCO ROOSTER...');

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

    console.log(`✓ Icono LOCO ROOSTER creado: ${config.name} (${config.size}x${config.size})`);
  }

  const fallbackPath = path.join(__dirname, '..', 'public', 'apple-touch-icon.png');
  fs.copyFileSync(path.join(ICONS_DIR, 'apple-touch-icon.png'), fallbackPath);

  console.log('✓ Todos los iconos PWA de LOCO ROOSTER se generaron exitosamente.');
}

generateIcons().catch((err) => {
  console.error('Error generando iconos:', err);
  process.exit(1);
});
