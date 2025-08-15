
// ===== JSON FILES AND COLOR PALETTE =====
const jsonFiles = [
  'bottomunderwear1.json','bottomunderwear2.json','bottomunderwear3.json',
  'topunderwear1.json','topunderwear2.json','topunderwear3.json','stocking1.json','stocking3.json',
  'onepiece1.json','onepiece3.json',
  'socks1.json','socks2.json','socks3.json',
  'boxers1.json','boxers2.json','boxers3.json',
  'sweatshirt1.json','sweatshirt2.json','sweatshirt3.json',
  'shoes1.json','shoes2.json','shoes3.json',
  'pants1.json','pants2.json','pants3.json',
  'skirt1.json','skirt2.json','skirt3.json',
  'top1.json','top2.json','top3.json',
  'dress1.json','dress2.json','dress3.json',
  'jacket1.json','jacket2.json','jacket3.json','dress1w.json',
  'bunnysuitbow1.json','bunnysuitbow2.json','bunnysuitbow3.json',
  'dress2w.json','dress3w.json','skirt1w.json','skirt2w.json','skirt3w.json',
  'accessories1.json','accessories2.json','accessories3.json',
  'hat1.json','hat2.json','hat3.json',
  'mask1.json','mask2.json','mask3.json',
  'bow1.json','bow2.json','bow3.json'
];

const colorPalette = [
  { name:'Original', value:'none' },
  { name:'Red', value:'hue-rotate(0deg)' },
  { name:'Blue', value:'hue-rotate(240deg)' },
  { name:'Green', value:'hue-rotate(120deg)' },
  { name:'Purple', value:'hue-rotate(270deg)' },
  { name:'Orange', value:'hue-rotate(30deg)' },
  { name:'Pink', value:'hue-rotate(320deg)' },
  { name:'Yellow', value:'hue-rotate(60deg)' },
  { name:'Cyan', value:'hue-rotate(180deg)' }
];

let currentlySelectedItem = null;

// ===== HELPERS =====
function getZIndex(categoryName) {
  // FIX: normalize to base (e.g., 'top3' -> 'top', 'dress1w' -> 'dress')
  const base = String(categoryName).replace(/\d+w?$/,'');
  const zIndexMap = {
    stocking: 20,
    bottomunderwear: 30,
    topunderwear: 40,
    onepiece: 50,
    socks: 55,
    boxers: 60,
    sweatshirt: 70,
    shoes: 80,
    pants: 90,
    skirt: 100,
    top: 110,
    dress: 130,
    jacket: 140,
    accessories: 150,
    hat: 160,
    mask: 170,
    bow: 180
  };
  return zIndexMap[base] || 0;
}

async function loadItemFile(file) {
  try {
    const response = await fetch(file);
    if (!response.ok) throw new Error(`Error loading file: ${file}`);
    return await response.json();
  } catch (error) {
    console.error(`Failed to load ${file}:`, error);
    return [];
  }
}

function hideSpecificCategories(categories) {
  categories.forEach(category => {
    document.querySelectorAll(`.${category}`).forEach(item => {
      item.style.visibility = 'hidden';
    });
  });
}

// ===== TOGGLE VISIBILITY =====
function toggleVisibility(itemId, categoryName) {
  document.querySelectorAll(`.${categoryName}`).forEach(item => {
    if (item.id !== itemId) item.style.visibility = 'hidden';
  });

  const selectedItem = document.getElementById(itemId);
  if (!selectedItem) return; // FIX: guard

  selectedItem.style.visibility = selectedItem.style.visibility === 'visible' ? 'hidden' : 'visible';

  if (selectedItem.style.visibility === 'visible') {
    const hideMap = {
      onepiece1: ['topunderwear1','bottomunderwear1'],
      onepiece3: ['topunderwear3','bottomunderwear3'],
      topunderwear1: ['onepiece1'],
      bottomunderwear1: ['onepiece1'],
      topunderwear3: ['onepiece3'],
      bottomunderwear3: ['onepiece3'],
      dress1: ['top1','pants1','skirt1','sweatshirt1','bunnysuitbow1'],
      dress2: ['top2','pants2','skirt2','sweatshirt2','bunnysuitbow2'],
      dress3: ['top3','pants3','skirt3','sweatshirt3','bunnysuitbow3'],
      bunnysuitbow1: ['dress1','jacket1'],
      bunnysuitbow2: ['dress2','jacket2'],
      bunnysuitbow3: ['dress3','jacket3'],
      jacket1: ['bunnysuitbow1'],
      jacket2: ['bunnysuitbow2'],
      jacket3: ['bunnysuitbow3'],
      // FIX: socks mapping
      stocking1: ['socks1'],
      socks1: ['stocking1'],
      stocking2: ['socks2'],
      socks2: ['stocking2'],
      stocking3: ['socks3'],
      socks3: ['stocking3'],
      pants1: ['skirt1'],
      skirt1: ['pants1'],
      pants2: ['skirt2'],
      skirt2: ['pants2'],
      pants3: ['skirt3'],
      skirt3: ['pants3']
    };

    if (hideMap[categoryName]) {
      hideSpecificCategories(hideMap[categoryName]);
    } else if (
      categoryName.startsWith('top1') || categoryName.startsWith('pants1') ||
      categoryName.startsWith('skirt1') || categoryName.startsWith('sweatshirt1')
    ) {
      hideSpecificCategories(['dress1']);
    } else if (
      categoryName.startsWith('top2') || categoryName.startsWith('pants2') ||
      categoryName.startsWith('skirt2') || categoryName.startsWith('sweatshirt2')
    ) {
      hideSpecificCategories(['dress2']);
    } else if (
      categoryName.startsWith('top3') || categoryName.startsWith('pants3') ||
      categoryName.startsWith('skirt3') || categoryName.startsWith('sweatshirt3')
    ) {
      hideSpecificCategories(['dress3']);
    }
  }
}

// ===== EXACT NAMED-COLOR RECOLOR (per-pixel, preserves alpha) =====
const NAMED_HUES = {
  Original: null,
  Red: 0, Orange: 30, Yellow: 60, Green: 120,
  Cyan: 180, Blue: 240, Purple: 270, Pink: 320
};

const _recolorCache = new Map(); // key: itemId|ColorName -> dataURL

function _rgbToHsl(r,g,b){
  r/=255; g/=255; b/=255;
  const max = Math.max(r,g,b), min = Math.min(r,g,b);
  let h, s, l = (max+min)/2;
  if (max === min) { h = 0; s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d/(2 - max - min) : d/(max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [h*360, s, l];
}

function _hslToRgb(h,s,l){
  h/=360;
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const hue2rgb = t => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };
  const r = Math.round(hue2rgb(h + 1/3) * 255);
  const g = Math.round(hue2rgb(h) * 255);
  const b = Math.round(hue2rgb(h - 1/3) * 255);
  return [r,g,b];
}

// Store original src once (so "Original" restores it)
function _ensureOriginalSrc(img){
  if (!img.dataset.originalSrc) {
    img.dataset.originalSrc = img.src || img.dataset.src || '';
  }
}

// Main API: set item to named color (true recolor)
async function setItemNamedColor(itemId, colorName){
  const el = document.getElementById(itemId);
  if (!el) return;

  // Restore original
  if (!colorName || colorName === 'Original' || NAMED_HUES[colorName] == null) {
    _ensureOriginalSrc(el);
    const orig = el.dataset.originalSrc;
    if (orig) el.src = orig;
    el.style.filter = ''; // clear any old filters
    return;
  }

  // Make sure the bitmap is loaded and CORS-safe for canvas
  if (!el.src && el.dataset && el.dataset.src) el.src = el.dataset.src;
  if (!el.crossOrigin) el.crossOrigin = 'anonymous';

  await new Promise(res => {
    if (el.complete && el.naturalWidth) res();
    else el.onload = () => res();
  });

  const targetHue = NAMED_HUES[colorName];
  const cacheKey = `${itemId}|${colorName}`;
  if (_recolorCache.has(cacheKey)) {
    el.src = _recolorCache.get(cacheKey);
    el.style.filter = '';
    return;
  }

  _ensureOriginalSrc(el);

  // Draw and recolor pixels
  const w = el.naturalWidth, h = el.naturalHeight;
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  try {
    ctx.drawImage(el, 0, 0, w, h);
  } catch (e) {
    // CORS-tainted fallback: use hue-rotate as last resort
    el.style.filter = `hue-rotate(${targetHue}deg) saturate(1.1)`;
    return;
  }

  const imgData = ctx.getImageData(0, 0, w, h);
  const d = imgData.data;

  for (let i = 0; i < d.length; i += 4) {
    const a = d[i+3];
    if (a === 0) continue; // keep transparent pixels
    const r = d[i], g = d[i+1], b = d[i+2];

    // skip greys very near black/white to avoid nasty tints
    const [hue, sat, light] = _rgbToHsl(r,g,b);
    if (light < 0.03 || light > 0.97) continue;

    // keep S/L, only set hue to target
    const [nr, ng, nb] = _hslToRgb(targetHue, sat, light);
    d[i] = nr; d[i+1] = ng; d[i+2] = nb;
  }

  ctx.putImageData(imgData, 0, 0);
  const url = canvas.toDataURL('image/png');
  _recolorCache.set(cacheKey, url);
  el.src = url;
  el.style.filter = '';
}
/* === Color Swatch Fixups (append only) === */
(() => {
  // 1) Bridge: some code reads window.currentlySelectedItem but it's declared with `let`.
  try {
    if (!('currentlySelectedItem' in window)) {
      Object.defineProperty(window, 'currentlySelectedItem', {
        get(){ try { return typeof currentlySelectedItem !== 'undefined' ? currentlySelectedItem : null; } catch(e){ return null; } },
        set(v){ try { currentlySelectedItem = v; } catch(e) { /* no-op */ } }
      });
    }
  } catch (e) { /* ignore */ }

  // 2) Idempotent, safe createColorPicker (in case a later stub overwrote the real one)
  function buildPickerOnce() {
    if (document.querySelector('.color-picker-container')) return; // already built

    const container = document.createElement('div');
    container.className = 'color-picker-container';
    container.style.display = 'none';

    const title = document.createElement('h4');
    title.textContent = 'Choose Color:';
    container.appendChild(title);

    const grid = document.createElement('div');
    grid.className = 'color-grid';

    // Use your existing palette so the swatch-upgrade can convert them to circles
    (window.colorPalette || []).forEach(c => {
      const btn = document.createElement('button');
      btn.className = 'color-button';
      btn.textContent = c.name;
      // keep old behavior for fallback (CSS filter)
      btn.onclick = () => window.applyColorToItem?.(c.value);
      grid.appendChild(btn);
    });

    container.appendChild(grid);

    const close = document.createElement('button');
    close.className = 'close-color-picker';
    close.textContent = 'Close';
    close.onclick = () => window.hideColorPicker?.();
    container.appendChild(close);

    (document.querySelector('.controls') || document.body).appendChild(container);
  }

  // Replace/restore global createColorPicker to the safe one (append-only override).
  window.createColorPicker = function() { buildPickerOnce(); };

  // Build immediately if not present (covers the case where a stub ran earlier)
  buildPickerOnce();
})();
// --- SAFE COLOR PICKER (null-safe + calls setItemNamedColor) ---
function createColorPicker() {
  // idempotent: only create once
  if (document.querySelector('.color-picker-container')) return;

  const container = document.createElement('div');
  container.classList.add('color-picker-container');
  container.style.display = 'none';

  const title = document.createElement('h4');
  title.textContent = 'Choose Color:';
  container.appendChild(title);

  const grid = document.createElement('div');
  grid.classList.add('color-grid');
  colorPalette.forEach(color => {
    const btn = document.createElement('button');
    btn.classList.add('color-button');
    btn.textContent = color.name;
    btn.onclick = () => {
      if (!currentlySelectedItem) return;
      setItemNamedColor(currentlySelectedItem, color.name);
      hideColorPicker();
    };
    grid.appendChild(btn);
  });
  container.appendChild(grid);

  const close = document.createElement('button');
  close.textContent = 'Close';
  close.classList.add('close-color-picker');
  close.onclick = hideColorPicker;
  container.appendChild(close);

  const host = document.querySelector('.controls') || document.body;
  host.appendChild(container);
}

function ensureColorPicker() {
  if (!document.querySelector('.color-picker-container')) createColorPicker();
}

function showColorPicker(itemId) {
  currentlySelectedItem = itemId;
  ensureColorPicker();
  const el = document.querySelector('.color-picker-container');
  if (el) el.style.display = 'block';
}

function hideColorPicker() {
  const el = document.querySelector('.color-picker-container');
  if (el) el.style.display = 'none';
  currentlySelectedItem = null;
}

// Make sure it exists early (prevents null.style errors)
document.addEventListener('DOMContentLoaded', ensureColorPicker);

// ===== LOAD ITEMS (single, no duplicates) =====
async function loadItemsInBatches(batchSize = 5, delay = 50) { // FIX: keep one version
  const baseContainer = document.querySelector('.base-container');
  const controlsContainer = document.querySelector('.controls');
  if (!baseContainer) return;

  createColorPicker();

  for (let i = 0; i < jsonFiles.length; i += batchSize) {
    const batch = jsonFiles.slice(i, i + batchSize);

    await Promise.all(batch.map(async file => {
      const data = await loadItemFile(file);
      const categoryName = file.replace('.json', '');

      const fragment = document.createDocumentFragment();
      data.forEach(item => {
        const itemId = item.id.endsWith('.png') ? item.id : `${item.id}.png`;

        // IMG (CORS-safe for recolor)
        const img = new Image();
        img.crossOrigin = "anonymous"; // FIX: allow canvas read
        img.id = itemId;
        img.src = item.src;
        img.alt = item.alt || itemId;
        img.className = categoryName;
        img.setAttribute('data-file', file);
        img.style.visibility = item.visibility === "visible" ? "visible" : "hidden";
        img.style.position = 'absolute';
        img.style.zIndex = getZIndex(categoryName);
        fragment.appendChild(img);

        // BUTTONS
        if (controlsContainer) {
          let panel = document.getElementById(`panel-${categoryName}`);
          if (!panel) {
            panel = document.createElement('div');
            panel.id = `panel-${categoryName}`;
            const h3 = document.createElement('h3');
            h3.textContent = categoryName;
            panel.appendChild(h3);
            controlsContainer.appendChild(panel);
          }

          const buttonContainer = document.createElement('div');
          buttonContainer.classList.add('button-container');

          const buttonWrap = document.createElement('div');
          buttonWrap.classList.add('button-wrap');

          const button = document.createElement('img');
          const buttonFile = item.src.replace('.png', 'b.png');
          button.src = buttonFile;
          button.alt = (item.alt || '') + ' Button';
          button.classList.add('item-button');
          button.onclick = () => toggleVisibility(itemId, categoryName);
          buttonWrap.appendChild(button);

          const colorButton = document.createElement('button');
          colorButton.textContent = '🎨';
          colorButton.classList.add('color-change-button');
          colorButton.onclick = (e) => {
            e.stopPropagation();
            const targetItem = document.getElementById(itemId);
            if (targetItem && targetItem.style.visibility === 'hidden') {
              toggleVisibility(itemId, categoryName);
            }
            showColorPicker(itemId);
          };
          buttonWrap.appendChild(colorButton);

          buttonContainer.appendChild(buttonWrap);
          panel.appendChild(buttonContainer);
        }
      });

      baseContainer.appendChild(fragment);
    }));

    await new Promise(res => setTimeout(res, delay));
  }

  const loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen) loadingScreen.style.display = 'none';
}

// ===== LAYOUT AND GAME =====
function adjustCanvasLayout() {
  const base = document.querySelector('.base-container');
  const controls = document.querySelector('.controls');
  if (!base || !controls) return;
  const isMobile = window.innerWidth <= 600;
  base.classList.toggle('mobile-layout', isMobile);
  base.classList.toggle('desktop-layout', !isMobile);
  controls.classList.toggle('mobile-controls', isMobile);
  controls.classList.toggle('desktop-controls', !isMobile);
}

function enterGame() {
  document.querySelector('.main-menu')?.style && (document.querySelector('.main-menu').style.display = 'none');
  document.querySelector('.game-container')?.style && (document.querySelector('.game-container').style.display = 'block');

  const audio = document.getElementById("backgroundMusic");
  const musicBtn = document.getElementById("musicToggleButton");
  if (audio && musicBtn && audio.paused) musicBtn.click();
}

function blurButton(event) {
  event.preventDefault();
  event.target.blur();
}

function handleButtonPressRelease(buttonClass, imageId) {
  const button = document.querySelector(buttonClass);
  if (!button) return;
  const press = e => { blurButton(e); const el = document.getElementById(imageId); if (el) el.style.display = 'block'; };
  const release = e => { blurButton(e); const el = document.getElementById(imageId); if (el) el.style.display = 'none'; };
  button.addEventListener('mousedown', press);
  button.addEventListener('mouseup', release);
  button.addEventListener('touchstart', press, { passive: false });
  button.addEventListener('touchend', release, { passive: false });
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  handleButtonPressRelease('.button-1', 'base2-image');
  handleButtonPressRelease('.button-2', 'base3-image');
  handleButtonPressRelease('.button-3', 'base4-image');
  adjustCanvasLayout();
});

window.addEventListener('resize', adjustCanvasLayout);

window.addEventListener('load', () => {
  loadItemsInBatches();  // FIX: single loader
  adjustCanvasLayout();
  const loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen) loadingScreen.style.display = 'none';
});

// ===== WIND EFFECTS =====
function applyWindEffect() {
  for (let i = 1; i <= 10; i++) {
    const pairs = [
      [`skirt1_${i}.png`,`skirt1_${i}w.png`],
      [`dress1_${i}.png`,`dress1_${i}w.png`],
      [`skirt2_${i}.png`,`skirt2_${i}w.png`],
      [`dress2_${i}.png`,`dress2_${i}w.png`],
      [`skirt3_${i}.png`,`skirt3_${i}w.png`],
      [`dress3_${i}.png`,`dress3_${i}w.png`],
    ];
    pairs.forEach(([normalId, windId]) => {
      const normal = document.getElementById(normalId);
      const wind = document.getElementById(windId);
      if (normal && wind && normal.style.visibility === 'visible') {
        normal.style.visibility = 'hidden';
        wind.style.visibility = 'visible';
      }
    });
  }
}

function removeWindEffect() {
  for (let i = 1; i <= 10; i++) {
    const pairs = [
      [`skirt1_${i}w.png`,`skirt1_${i}.png`],
      [`dress1_${i}w.png`,`dress1_${i}.png`],
      [`skirt2_${i}w.png`,`skirt2_${i}.png`],
      [`dress2_${i}w.png`,`dress2_${i}.png`],
      [`skirt3_${i}w.png`,`skirt3_${i}.png`],
      [`dress3_${i}w.png`,`dress3_${i}.png`],
    ];
    pairs.forEach(([windId, normalId]) => {
      const wind = document.getElementById(windId);
      const normal = document.getElementById(normalId);
      if (wind && normal && wind.style.visibility === 'visible') {
        wind.style.visibility = 'hidden';
        normal.style.visibility = 'visible';
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const windButton = document.getElementById("wind-button");
  if (!windButton) return;
  windButton.addEventListener("mousedown", applyWindEffect);
  windButton.addEventListener("mouseup", removeWindEffect);
  windButton.addEventListener("mouseleave", removeWindEffect);
  windButton.addEventListener("touchstart", e => { e.preventDefault(); applyWindEffect(); }, { passive: false });
  windButton.addEventListener("touchend",   e => { e.preventDefault(); removeWindEffect(); }, { passive: false });
});
/* === Color Swatch Upgrade (Aug 9, 2025) — append only === */
(() => {
  // Map swatch fill colors (UI only). "Original" shows a checkerboard.
  const SWATCH_HEX = {
    Original: null,
    Red: '#ff3b30',
    Orange: '#ff9500',
    Yellow: '#ffcc00',
    Green: '#34c759',
    Cyan: '#32ade6',
    Blue: '#007aff',
    Purple: '#af52de',
    Pink: '#ff2d55'
  };

  function enhanceColorPicker() {
    const picker = document.querySelector('.color-picker-container');
    if (!picker) return false;

    const grid = picker.querySelector('.color-grid');
    if (!grid) return false;

    const btns = Array.from(grid.querySelectorAll('.color-button'));
    if (!btns.length) return false;

    // Turn each existing text button into a circular swatch.
    btns.forEach((btn) => {
      const name = (btn.textContent || '').trim();
      const hex = SWATCH_HEX[name] ?? null;

      // Make label screen-reader only; visual is the color circle
      btn.innerHTML = `<span class="visually-hidden">${name}</span>`;
      btn.setAttribute('aria-label', name);
      btn.setAttribute('role', 'radio');
      btn.setAttribute('aria-checked', 'false');
      btn.title = name;

      if (name === 'Original') {
        btn.classList.add('original');
        btn.style.background = '';
      } else if (hex) {
        btn.style.background = hex;
      }

      // Keep a reference to the original onclick (which used filters) for fallback.
      const originalOnclick = btn.onclick;

      // Replace with higher-quality recolor + auto-fallback.
      btn.onclick = async (e) => {
        e.stopPropagation();
        // Nothing selected? defer to original behavior.
        if (!window.currentlySelectedItem) {
          originalOnclick?.(e);
          return;
        }

        try {
          // Use named, per-pixel recoloring (preserves alpha).
          await window.setItemNamedColor(window.currentlySelectedItem, name);
        } catch {
          // If canvas/CORS blocks this, fall back to your existing filter logic.
          originalOnclick?.(e);
        }

        // Selection ring
        btns.forEach(b => b.setAttribute('aria-checked', 'false'));
        btn.setAttribute('aria-checked', 'true');

        // Close after choose (keeps your current UX)
        window.hideColorPicker?.();
      };
    });

    // mark as enhanced so we don't do it twice
    grid.dataset.enhanced = '1';
    return true;
  }

  // Try once on load, and also watch for when the picker is created dynamically.
  const tryEnhance = () => {
    if (document.querySelector('.color-grid[data-enhanced="1"]')) return;
    enhanceColorPicker();
  };

  window.addEventListener('load', tryEnhance);

  const mo = new MutationObserver(() => tryEnhance());
  mo.observe(document.body, { childList: true, subtree: true });
})();
/* === WIND COLOR SYNC (append-only) === */
(() => {
  // Keep original recolor, then wrap it so we remember color and pre-sync the sibling
  const __origSetItemNamedColor = window.setItemNamedColor;

  function normalizeColorName(c) {
    return (!c || c === 'Original') ? 'Original' : c;
  }

  async function recolorAndRemember(id, colorName) {
    await __origSetItemNamedColor(id, colorName);
    const el = document.getElementById(id);
    if (el) el.dataset.colorName = normalizeColorName(colorName);
  }

  // Wrap the global setItemNamedColor to also recolor the wind/normal sibling
  window.setItemNamedColor = async function(itemId, colorName) {
    await recolorAndRemember(itemId, colorName);

    // Only for skirt/dress items that have wind variants
    const m = String(itemId).match(/^((?:skirt|dress)[123]_\d+)(w?)\.png$/);
    if (m) {
      const base = m[1];
      const hasW = !!m[2];
      const siblingId = hasW ? `${base}.png` : `${base}w.png`;
      if (document.getElementById(siblingId)) {
        await recolorAndRemember(siblingId, colorName);
      }
    }
  };

  // When wind is toggled, ensure the visible variant adopts the remembered color
  async function syncWindColorsOnce() {
    for (let i = 1; i <= 10; i++) {
      const PAIRS = [
        [`skirt1_${i}.png`,`skirt1_${i}w.png`],
        [`dress1_${i}.png`,`dress1_${i}w.png`],
        [`skirt2_${i}.png`,`skirt2_${i}w.png`],
        [`dress2_${i}.png`,`dress2_${i}w.png`],
        [`skirt3_${i}.png`,`skirt3_${i}w.png`],
        [`dress3_${i}.png`,`dress3_${i}w.png`],
      ];

      for (const [normalId, windId] of PAIRS) {
        const normal = document.getElementById(normalId);
        const wind   = document.getElementById(windId);
        if (!normal || !wind) continue;

        const wanted =
          (normal.dataset && normal.dataset.colorName) ||
          (wind.dataset && wind.dataset.colorName) ||
          'Original';

        // If wind is showing, recolor wind; if normal is showing, recolor normal
        if (wind.style.visibility === 'visible' && normal.style.visibility !== 'visible') {
          await recolorAndRemember(windId, wanted);
        } else if (normal.style.visibility === 'visible' && wind.style.visibility !== 'visible') {
          await recolorAndRemember(normalId, wanted);
        }
      }
    }
  }

  // Run our sync right AFTER the existing wind handlers fire
  document.addEventListener('DOMContentLoaded', () => {
    const windBtn = document.getElementById('wind-button');
    if (!windBtn) return;
    const after = () => setTimeout(syncWindColorsOnce, 0);
    ['mousedown','mouseup','mouseleave','touchstart','touchend'].forEach(evt => {
      windBtn.addEventListener(evt, after);
    });
  });
})();
/* === WIND VARIANT COLOR SYNC (append-only) === */
(() => {
  if (window.__windColorSyncInstalled) return;
  window.__windColorSyncInstalled = true;

  // Keep original recolor
  const __origSetItemNamedColor =
    window.__origSetItemNamedColor || window.setItemNamedColor;
  window.__origSetItemNamedColor = __origSetItemNamedColor;

  function normName(c){ return (!c || c === 'Original') ? 'Original' : c; }

  async function recolorRemember(id, name){
    if (typeof __origSetItemNamedColor !== 'function') return;
    await __origSetItemNamedColor(id, name);
    const el = document.getElementById(id);
    if (el) el.dataset.colorName = normName(name);
  }

  // Wrap setItemNamedColor so choosing Red on dress1_1 also paints dress1_1w (and vice-versa)
  if (typeof window.setItemNamedColor === 'function') {
    const wrapped = window.setItemNamedColor;
    window.setItemNamedColor = async function(itemId, colorName){
      await recolorRemember(itemId, colorName);

      const m = /^((?:skirt|dress)[123]_\d+)(w?)\.png$/.exec(String(itemId));
      if (!m) return;

      const base = m[1];
      const siblingId = m[2] ? `${base}.png` : `${base}w.png`;
      if (document.getElementById(siblingId)) {
        await recolorRemember(siblingId, colorName);
      }
    };
  }

  // When wind is pressed/released, recolor whichever side is visible to the remembered color
  async function syncWindColors(){
    const kinds = ['skirt','dress'];
    for (const k of kinds){
      for (let num = 1; num <= 3; num++){
        for (let i = 1; i <= 10; i++){
          const normalId = `${k}${num}_${i}.png`;
          const windId   = `${k}${num}_${i}w.png`;
          const normal = document.getElementById(normalId);
          const wind   = document.getElementById(windId);
          if (!normal && !wind) continue;

          const wanted =
            (normal && normal.dataset.colorName) ||
            (wind && wind.dataset.colorName) ||
            'Original';

          if (wind && wind.style.visibility === 'visible' &&
              (!normal || normal.style.visibility !== 'visible')) {
            await recolorRemember(windId, wanted);
          } else if (normal && normal.style.visibility === 'visible' &&
                     (!wind || wind.style.visibility !== 'visible')) {
            await recolorRemember(normalId, wanted);
          }
        }
      }
    }
  }

  // Hook after your existing wind-button handlers
  document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('wind-button');
    if (!btn) return;
    const after = () => setTimeout(syncWindColors, 0);
    ['mousedown','mouseup','mouseleave','touchstart','touchend']
      .forEach(evt => btn.addEventListener(evt, after, { passive:false }));
  });
})();