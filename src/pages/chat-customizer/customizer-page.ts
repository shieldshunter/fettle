/*
  customizer-page.ts – Rev 9 (logo‑width sliders, completed)
  ---------------------------------------------------------------------------
  Behaviour summary:
    • 5 s TSR loading animation → type the three demo sentences (once, slowly)
      → back to the loader → repeat forever.

  New in **Rev 9**
    • Two width sliders let the user set the logo size independently for
        – the **typewriter cursor** (default 24 px)
        – the **loading animation** (default 48 px)
    • The preview updates live and values persist via LocalStorage.
*/

import clusterCssText from '../cluster/cluster-page-styles.css?inline';
import { generateSilhouetteIcon } from '../../components/api/icon-from-image';   // adjust the path as needed

// ---------------------------------------------------------------------------
// Constants & helpers -------------------------------------------------------
// ---------------------------------------------------------------------------
const DEFAULT_LOGO_PATH = 'data/TSRIcon.png';
const LS_LOGO_KEY = 'customizer-logo';
const LS_PRESET_KEY = 'customizer-presets-v1';
const LS_TYPEWRITER_W_KEY = 'logo-width-typewriter';
const LS_LOADER_W_KEY = 'logo-width-loader';

/** Read an integer setting from localStorage, or fall back to default. */
const getNum = (k: string, d: number) => {
  const v = localStorage.getItem(k);
  return v !== null ? parseInt(v, 10) : d;
};

/** Persist an integer setting. */
const setNum = (k: string, v: number) => localStorage.setItem(k, String(v));

/** Short‑hand DOM helpers. */
const $ = (s: string, c: Document | HTMLElement = document) => c.querySelector<HTMLElement>(s);
const getVar = (v: string, d: string) =>
  localStorage.getItem(v) || ((getComputedStyle(document.documentElement) as any).getPropertyValue(v).trim() || d);
const setVar = (v: string, val: string) => {
  document.documentElement.style.setProperty(v, val);
  localStorage.setItem(v, val);
};

// ---------------- Variable‑colour controls --------------------------------
interface VariableControl {
  label: string;
  cssVar: string;
  type: 'color' | 'text';
  default: string;
}
const variableControls: VariableControl[] = [
  { label: 'Wave 1 colour', cssVar: '--wave-color-1', type: 'color', default: '#000000' },
  { label: 'Wave 3 colour', cssVar: '--wave-color-3', type: 'color', default: '#F36F21' },
  { label: 'Background colour', cssVar: '--color-bg', type: 'color', default: '#dddddd' },
  { label: 'Text colour', cssVar: '--color-text', type: 'color', default: '#000000' },
  { label: 'User message BG', cssVar: '--user-message-bg', type: 'color', default: 'rgb(27,99,182)' },
  { label: 'Assistant message BG', cssVar: '--assistant-message-bg', type: 'color', default: '#e36a1e' },
];

// ---------------- Preset handling -----------------------------------------
interface Preset {
  name: string;
  vars: Record<string, string>;
  logoDataUrl: string | null;
}
const loadPresets = (): Preset[] => {
  try {
    return JSON.parse(localStorage.getItem(LS_PRESET_KEY) || '[]');
  } catch {
    return [];
  }
};
const storePresets = (p: Preset[]) => localStorage.setItem(LS_PRESET_KEY, JSON.stringify(p));

// ---------------- Demo text ------------------------------------------------
const DEMO_LINES = [
  "Hi there! I'm your AI assistant 👋",
  'Tweak colours on the left ↙︎ and watch me change',
  'Save your theme as a preset below!',
];

// ---------------------------------------------------------------------------
// Typewriter clone ----------------------------------------------------------
// ---------------------------------------------------------------------------
function typeWriter(
  host: HTMLElement,
  text: string,
  onDone: () => void,
  logoSrc: string,
  logoWidth: number,
  speed = 35,
) {
  let i = 0;
  const span = document.createElement('span');
  span.className = 'typed-text-span';
  host.appendChild(span);

  const cursor = document.createElement('img');
  cursor.src = logoSrc;
  cursor.alt = 'TSR';
  cursor.className = 'tsr-inline-cursor';
  cursor.style.width = `${logoWidth}px`;
  span.appendChild(cursor);

  const step = () => {
    if (i < text.length) {
      const ch = text[i++];
      if (ch === '\n') span.insertBefore(document.createElement('br'), cursor);
      else span.insertBefore(document.createTextNode(ch), cursor);
      setTimeout(step, speed);
    } else {
      cursor.remove();
      onDone();
    }
  };
  step();
}

// Loader snippet (dynamic width) -------------------------------------------
function loaderHTML(logoSrc: string, logoWidth: number) {
  const dots = '<div class="dot"></div>'.repeat(20);
  return `<div class="tsr-loading-wrapper"><img class="tsr-icon loading" style="width:${logoWidth}px" src="${logoSrc}" alt="TSR"><div class="dot-stream-container"><div class="dot-stream">${dots}</div></div></div>`;
}

// ---------------------------------------------------------------------------
// Component -----------------------------------------------------------------
// ---------------------------------------------------------------------------
class CustomizerPage extends HTMLElement {
  private presets: Preset[] = [];
  private logoDataUrl: string | null = null;
  private bubble!: HTMLElement; // assistant bubble element reference

  // -----------------------------------------------------------------------
  // Lifecycle -------------------------------------------------------------
  // -----------------------------------------------------------------------
  connectedCallback() {
    this.classList.add('page-content', 'flex', 'gap-10', 'overflow-auto');
    this.render();
    this.presets = loadPresets();
    this.renderPresetList();

    const savedLogo = localStorage.getItem(LS_LOGO_KEY);
    if (savedLogo) this.logoDataUrl = savedLogo;

    this.startPreviewCycle();
  }

  // -----------------------------------------------------------------------
  // Rendering helpers ------------------------------------------------------
  // -----------------------------------------------------------------------
  private render() {
    this.innerHTML = '';
    const controls = this.buildControlsColumn();
    const preview = this.buildPreviewColumn();
    this.append(controls, preview);
  }

  private buildPreviewColumn() {
    const sec = document.createElement('section');
    sec.className = 'preview flex flex-col flex-grow p-6';
    sec.innerHTML = `<style>${clusterCssText}</style>
      <div class="cluster-container" style="font-size:14px;max-width:100%;">
        <div class="chat-messages" style="max-height:300px;">
          <div class="message-container user"><div class="message user-message">Hey – try changing my colour!</div></div>
          <div class="message-container assistant"><div id="assistantBubble" class="message assistant-message"></div></div>
        </div>
      </div>`;
    this.bubble = sec.querySelector('#assistantBubble') as HTMLElement;
    return sec;
  }

  // -----------------------------------------------------------------------
  // Preview cycle ----------------------------------------------------------
  // -----------------------------------------------------------------------
  private startPreviewCycle() {
    const loaderW = getNum(LS_LOADER_W_KEY, 48);
    const typerW  = getNum(LS_TYPEWRITER_W_KEY, 24);

    const showLoader = () => {
      const logo = this.logoDataUrl || DEFAULT_LOGO_PATH;           // fresh each time
      this.bubble.innerHTML = loaderHTML(logo, loaderW);
      setTimeout(showLines, 5000);
    };

    const showLines = () => {
      let idx = 0;
      const nextLine = () => {
        this.bubble.innerHTML = '';
        const logo = this.logoDataUrl || DEFAULT_LOGO_PATH;         // fresh each line
        typeWriter(
          this.bubble,
          DEMO_LINES[idx],
          () => {
            idx += 1;
            if (idx < DEMO_LINES.length) setTimeout(nextLine, 1400);
            else setTimeout(showLoader, 1400);
          },
          logo,
          typerW,
          45,
        );
      };
      nextLine();
    };

    showLoader();
  }


  // -----------------------------------------------------------------------
  // Controls column --------------------------------------------------------
  // -----------------------------------------------------------------------
  private buildControlsColumn() {
    const form = document.createElement('form');
    form.className = 'flex flex-col gap-4 p-4 w-full max-w-sm';

    // colour / text controls
    variableControls.forEach((c) => form.appendChild(this.buildVarControl(c)));

    // width sliders
    form.appendChild(this.buildWidthSlider('Loading logo width', LS_LOADER_W_KEY, 48, 16, 160));
    form.appendChild(this.buildWidthSlider('Typewriter logo width', LS_TYPEWRITER_W_KEY, 24, 16, 160));

    // logo uploader
    form.appendChild(this.buildLogoUploader());

    // reset button
    const reset = document.createElement('button');
    reset.type = 'button';
    reset.textContent = 'Reset vars ↻';
    reset.className = 'mt-1 border px-3 py-1 rounded text-sm';
    reset.onclick = () => this.resetVars();
    form.appendChild(reset);

    // presets section
    form.appendChild(this.buildPresetSection());

    return form;
  }

  private buildVarControl(c: VariableControl) {
    const wrap = document.createElement('div');
    wrap.className = 'flex items-center gap-3';

    const lab = document.createElement('label');
    lab.textContent = c.label;
    lab.className = 'w-40 text-sm';

    const input = document.createElement('input');
    input.type = c.type === 'color' ? 'color' : 'text';
    input.name = c.cssVar;
    input.value = getVar(c.cssVar, c.default);
    if (c.type === 'text') input.className = 'flex-1 border px-2 py-1 rounded';

    input.oninput = () => {
      setVar(c.cssVar, input.value);
      this.refreshColours();
    };

    wrap.append(lab, input);
    return wrap;
  }

  private buildWidthSlider(labelTxt: string, key: string, defVal: number, min: number, max: number) {
    const wrap = document.createElement('div');
    wrap.className = 'flex items-center gap-3';

    const lab = document.createElement('label');
    lab.textContent = labelTxt;
    lab.className = 'w-40 text-sm';

    const input = document.createElement('input');
    input.type = 'range';
    input.min = String(min);
    input.max = String(max);
    input.value = String(getNum(key, defVal));

    const val = document.createElement('span');
    val.textContent = `${input.value}px`;
    val.className = 'w-12 text-right text-sm font-mono';

    input.oninput = () => {
      const v = parseInt(input.value, 10);
      val.textContent = `${v}px`;
      setNum(key, v);
      this.updatePreviewLogoSizes();
    };

    wrap.append(lab, input, val);
    return wrap;
  }


  private buildLogoUploader() {
    const wrap = document.createElement('div');
    wrap.className = 'flex flex-col gap-2';

    const lab = document.createElement('label');
    lab.textContent = 'Upload side‑profile photo (auto‑generate icon):';

    const inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = 'image/*';

    const status = document.createElement('span');
    status.className = 'text-xs text-gray-600';

    inp.onchange = async () => {
      const file = inp.files?.[0];
      if (!file) return;

      try {
        status.textContent = 'Generating icon…';
        // 👉 call the helper (defaults to 1024 × 1024, customise if you like)
        const dataUrl = await generateSilhouetteIcon(file, { size: 512 });
        this.setLogo(dataUrl);              // existing method → updates preview + localStorage
        status.textContent = '✔ Icon applied';
      } catch (err: any) {
        console.error(err);
        alert(err.message || 'Failed to generate icon');
        status.textContent = '';
      } finally {
        inp.value = '';                     // reset <input> so same file can be re‑selected
      }
    };

    wrap.append(lab, inp, status);
    return wrap;
  }


  private buildPresetSection() {
    const sec = document.createElement('section');
    sec.className = 'mt-6';
    sec.innerHTML = '<h3 class="font-bold mb-2">Presets</h3>';

    const row = document.createElement('div');
    row.className = 'flex items-center gap-2 mb-3';

    const name = document.createElement('input');
    name.placeholder = 'Preset name';
    name.className = 'border px-2 py-1 rounded text-sm';

    const save = document.createElement('button');
    save.type = 'button';
    save.textContent = 'Save preset';
    save.className = 'border px-3 py-1 rounded text-sm';
    save.onclick = () => {
      if (!name.value.trim()) return alert('Please enter a name');
      const vars: Record<string, string> = {};
      variableControls.forEach((c) => (vars[c.cssVar] = getVar(c.cssVar, c.default)));
      this.presets.push({ name: name.value.trim(), vars, logoDataUrl: this.logoDataUrl });
      storePresets(this.presets);
      name.value = '';
      this.renderPresetList();
    };

    row.append(name, save);
    sec.append(row);

    const list = document.createElement('div');
    list.id = 'presetList';
    sec.append(list);
    return sec;
  }

  private buildPresetCard(p: Preset) {
    const card = document.createElement('div');
    card.className = 'border rounded p-2 flex flex-col items-start gap-2 w-40';

    const pal = document.createElement('div');
    pal.className = 'flex';
    ['--wave-color-1', '--wave-color-2', '--wave-color-3', '--wave-color-4'].forEach((v) => {
      const sw = document.createElement('div');
      sw.style.background = p.vars[v] || '#000';
      sw.style.width = '20px';
      sw.style.height = '20px';
      pal.append(sw);
    });

    const img = document.createElement('img');
    img.className = 'mt-1 w-8 h-8 object-contain';
    img.src = p.logoDataUrl || '';

    const nm = document.createElement('div');
    nm.textContent = p.name;
    nm.className = 'font-semibold text-sm';

    const row = document.createElement('div');
    row.className = 'flex gap-2 mt-1';

    const apply = document.createElement('button');
    apply.textContent = 'Apply';
    apply.className = 'border px-2 py-0.5 rounded text-xs';
    apply.onclick = () => this.applyPreset(p);

    const del = document.createElement('button');
    del.textContent = '✕';
    del.className = 'text-red-600 text-xs';
    del.onclick = () => {
      this.presets = this.presets.filter((x) => x !== p);
      storePresets(this.presets);
      this.renderPresetList();
    };

    row.append(apply, del);
    card.append(pal, img, nm, row);
    return card;
  }

  private renderPresetList() {
    const list = this.querySelector('#presetList') as HTMLElement;
    if (!list) return;
    list.innerHTML = '';
    this.presets.forEach((p) => list.append(this.buildPresetCard(p)));
  }

  // -----------------------------------------------------------------------
  // State helpers ----------------------------------------------------------
  // -----------------------------------------------------------------------
  private refreshColours() {
    const u = this.querySelector('.user-message') as HTMLElement;
    const a = this.querySelector('.assistant-message') as HTMLElement;
    if (u) u.style.background = getVar('--user-message-bg', 'rgb(27,99,182)');
    if (a) a.style.background = getVar('--assistant-message-bg', '#e36a1e');
  }

  private applyPreset(p: Preset) {
    Object.entries(p.vars).forEach(([k, v]) => {
      setVar(k, v);
      const inp = this.querySelector(`input[name='${k}']`) as HTMLInputElement;
      if (inp) inp.value = v;
    });

    if (p.logoDataUrl) this.setLogo(p.logoDataUrl);
    this.refreshColours();
    this.updatePreviewLogoSizes();
  }

  private resetVars() {
    variableControls.forEach((c) => {
      setVar(c.cssVar, c.default);
      const inp = this.querySelector(`input[name='${c.cssVar}']`) as HTMLInputElement;
      if (inp) inp.value = c.default;
    });
    this.refreshColours();
  }

  private setLogo(url: string) {
    this.logoDataUrl = url;
    localStorage.setItem(LS_LOGO_KEY, url);
    this.updatePreviewLogoSizes();
  }

  /** Update the width of any logos currently visible in the preview. */
  private updatePreviewLogoSizes() {
    const loaderW = getNum(LS_LOADER_W_KEY, 48);
    const typerW = getNum(LS_TYPEWRITER_W_KEY, 24);
    this.querySelectorAll<HTMLImageElement>('.tsr-icon.loading').forEach((img) => (img.style.width = `${loaderW}px`));
    this.querySelectorAll<HTMLImageElement>('.tsr-inline-cursor').forEach((img) => (img.style.width = `${typerW}px`));
  }
}

customElements.define('customizer-page', CustomizerPage);
