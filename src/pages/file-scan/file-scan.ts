import cssText from './file-scan-styles.css?inline';
import { exportSimpleCSV } from '../../utils/csv';
import { CAD_GROUPS } from '../../utils/cadExtensions';

const sheet = new CSSStyleSheet(); sheet.replaceSync(cssText);


function dirname(fullPath: string): string {
  return fullPath.replace(/\\/g, '/').replace(/\/[^/]*$/, '');
}



function isInRoot(full: string, roots: Set<string>): boolean {
  const lower = full.toLowerCase();
  for (const r of roots) {
    if (lower.startsWith(r)) return true;
  }
  return false;
}

type FileInfo = { fullPath: string; size: number; mtime: number };

class FileScanPage extends HTMLElement {
  public shadow: ShadowRoot;
  public roots: string[] = [];
  public allFiles: FileInfo[] = [];
  public keptSet = new Set<string>();        // absolute paths
  public droppedSet = new Set<string>();

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.adoptedStyleSheets = [sheet];
    this.shadow.innerHTML = /*html*/`
      <div class="scan-container">
        <h2>Folder Scan (β)</h2>

        <div id="rootPicker">
          <button id="addRootBtn" class="bin-button">+ Add Folder</button>
          <ul id="rootList"></ul>
        </div>

        <div class="select-controls">
        <button id="selectAllTypes"    class="bin-button">Select All</button>
        <button id="deselectAllTypes"  class="bin-button">Deselect All</button>
        </div>

        <div id="typeSelector" class="type-selector"></div>

        <button id="scanBtn"    class="bin-button" disabled>⚡ Scan CAD Files</button>
        <div id="logArea" class="log"></div>

        <div id="dupeArea"></div>

        <div class="actions">
            <button id="dlKept"     class="bin-button" disabled>📥 Download Kept</button>
            <button id="dlDrop"     class="bin-button" disabled>📥 Download Dropped</button>
        </div>
      </div>`;
  }

  connectedCallback() {

    const isElectron = !!(window as any).electronAPI?.selectFolder;

    if (!isElectron) {
        this.renderDownloadBanner();
        return;                                   // skip the rest of the setup
    }

    const saved = loadProgress();
    if (saved) {
    Object.assign(this, {
        roots:          saved.roots ?? [],
        allFiles:       saved.allFiles ?? [],
        dupeQueue:      saved.dupeQueue ?? [],
        keptSet:        new Set(saved.kept ?? []),
        droppedSet:     new Set(saved.dropped ?? []),
        preferredRoots: new Set(saved.preferredRoots ?? []),
        history:        saved.history ?? []
    });

    // if we still have duplicates left, jump straight into the wizard
    if (this.dupeQueue.length) {
        this.refreshRootList();          // show roots that were scanned
        this.renderNextDup();            // resume wizard
        return;                          // skip normal init
    }
    }

    if (saved) {
        const resetBtn = document.createElement('button');
        resetBtn.textContent = 'Start new scan';
        resetBtn.className = 'bin-button';
        resetBtn.onclick = () => {
            localStorage.removeItem(STORAGE_KEY);
            location.reload();          // full reset
        };
        this.shadow.prepend(resetBtn);
        }


    this.shadow.getElementById('addRootBtn')!.addEventListener('click', () => this.pickFolder());
    this.shadow.getElementById('scanBtn')!.addEventListener('click', () => this.runScan());
    const dlKeptBtn = this.shadow.getElementById('dlKept') as HTMLButtonElement | null;
    const dlDropBtn = this.shadow.getElementById('dlDrop') as HTMLButtonElement | null;

        if (dlKeptBtn) dlKeptBtn.addEventListener('click', () =>
        exportSimpleCSV(this.rowsForCSV('kept'),
                        `kept_${Date.now()}.csv`)
        );

        // ── Download Dropped ─────────────────────────────
        if (dlDropBtn) dlDropBtn.addEventListener('click', () =>
        exportSimpleCSV(this.rowsForCSV('dropped'),
                        `dropped_${Date.now()}.csv`)
        );

      this.renderTypeSelector();
      this.updateScanBtn();      // initial state

        /* re-run every time a pill toggles */
        this.shadow.querySelectorAll('.ext-btn')
            .forEach(btn => btn.addEventListener('click', () => this.updateScanBtn()));

    

  }

  

  private renderDownloadBanner() {
    this.shadow.innerHTML = `
        <div class="scan-container">
        <h2>Folder Scan (β)</h2>
        <div class="helper-banner">
            <p>
            Local folder scanning requires the free
            <strong>Trebro Desktop Helper</strong>.
            </p>
            <a class="bin-button" href="https://drive.google.com/drive/folders/1YHwhOM2QVv1Wp3kt5Y9xOWoKPptytiq_?usp=sharing"
            download>
            ⬇️ Download for Windows
            </a>
            <p style="font-size:13px;opacity:.7;margin-top:4px;">
            (Run the installer, then reopen this page inside the app.)
            </p>
        </div>
        </div>
    `;
    }
  private collapseAndMarkBubbles() {
  this.shadow
      .querySelectorAll<HTMLDetailsElement>('.cad-bubble')
      .forEach(bubble => {
        const hasActive = !!bubble.querySelector('.ext-btn.active');

        // close it
        bubble.open = false;                  // <details open="false">
        // OR: bubble.removeAttribute('open');

        // mark state
        bubble.classList.toggle('selected-bubble', hasActive);
      });
}
public history: {
  group: { key: string; files: FileInfo[] };
  kept:  string[];              // paths kept during that step
  dropped: string[];            // paths dropped during that step
  newPreferred?: string;        // folder added to preferredRoots
}[] = [];

private updateScanBtn() {
  const scanBtn = this.shadow.getElementById('scanBtn') as HTMLButtonElement;
  const anyChecked = !!this.shadow.querySelector('.ext-btn.active');
  scanBtn.disabled = !anyChecked || this.roots.length === 0;
}

private buildRegexFromSelector(): string {
  const exts = Array.from(this.shadow.querySelectorAll<HTMLButtonElement>('.ext-btn.active'))
                     .map(b => b.dataset.ext!.toLowerCase());
  if (!exts.length) return '';                     // block scan if nothing selected
  const extPart = exts.join('|');
  return String.raw`^(?!~\$).*(\.(${extPart}))(\.[[:digit:]]+)?$`;
}
/** all dup groups after scan:  [ {key, files[]}, … ] */
public dupeQueue: { key: string; files: FileInfo[] }[] = [];

/** folders the user has already kept – informs future auto-picks */
public preferredRoots = new Set<string>();

private renderTypeSelector() {
  const host = this.shadow.getElementById('typeSelector') as HTMLDivElement;
  host.innerHTML = '';                          // clear if rerendering

  CAD_GROUPS.forEach(sys => {
    const sysDiv = document.createElement('details');
    sysDiv.classList.add('cad-bubble');
    sysDiv.open = true;                         // 🔹 keep every pill open
    sysDiv.innerHTML = `<summary>${sys.label}</summary>`;

    sys.groups.forEach(grp => {
      const grpDiv = document.createElement('div');

      grp.exts.forEach(ext => {
        const btn = document.createElement('button');
        btn.className = 'ext-btn';              // new style below
        btn.dataset.ext = ext;
        btn.textContent = '.' + ext;
        // OFF by default –> no 'active' class
        btn.addEventListener('click', () => {
          btn.classList.toggle('active');       // switch colour
          this.updateScanBtn();                 // re-enable/disable Scan
        });
        grpDiv.appendChild(btn);
      });

      sysDiv.appendChild(grpDiv);
    });

    host.appendChild(sysDiv);
  });

  /* wire Select-/Deselect-All buttons once */
  const selAll = this.shadow.getElementById('selectAllTypes')  as HTMLButtonElement;
  const desAll = this.shadow.getElementById('deselectAllTypes') as HTMLButtonElement;
  selAll.onclick = () => {
    host.querySelectorAll<HTMLButtonElement>('.ext-btn').forEach(b => b.classList.add('active'));
    this.updateScanBtn();
  };
  desAll.onclick = () => {
    host.querySelectorAll<HTMLButtonElement>('.ext-btn').forEach(b => b.classList.remove('active'));
    this.updateScanBtn();
  };
}

  /* ---------- 1. folder picking ---------- */
private async pickFolder() {
  const api = (window as any).electronAPI;
  console.log('[pickFolder] api =', api);      // <-- add

  const path = await api.selectFolder();       // opens dialog
  console.log('[pickFolder] selected path =', path);  // add

  if (!path) return;                          // user cancelled
  this.roots.push(path);
  this.refreshRootList();
  this.updateScanBtn();
}

  private refreshRootList() {
    const ul = this.shadow.getElementById('rootList')!;
    ul.innerHTML = this.roots.map(r => `<li>${r}</li>`).join('');
  }

  /* ---------- 2. run folderScan ---------- */
  private async runScan() {
    this.collapseAndMarkBubbles();
    this.allFiles = [];
    for (const root of this.roots) {
      await this.streamScan(root);
    }
    this.detectDuplicates();
  }

private async streamScan(root: string) {
  const log = this.shadow.getElementById('logArea')!;
  log.textContent += `→ scanning ${root}\n`;

  const regex = this.buildRegexFromSelector();
  if (!regex) return alert('Select at least one file-type first!');

  try {
    const { out } = await (window as any).electronAPI.runScan(root, regex);   // IPC

    /* ── NEW PARSE LOOP ───────────────────────────────────────────── */
        out.forEach((line: string) => {
        // global, non-greedy match of “anything up to ?digits&digits”
        const tokenRegex = /(.+?\?\d+&\d+)/g;
        const matches = line.matchAll(tokenRegex);

        for (const m of matches) {
            const token = m[1];                                 // full match
            const parts = token.match(/^(?<full>.+?)\?(?<mtime>\d+)&(?<size>\d+)$/);
            if (!parts?.groups) continue;                       // should always hit

            this.allFiles.push({
            fullPath: parts.groups.full,
            size:     +parts.groups.size,
            mtime:    +parts.groups.mtime
            });
            log.textContent += token + '\n';                    // echo parsed file
        }
        });
    /* ─────────────────────────────────────────────────────────────── */

  } catch (err: any) {
    log.textContent += 'ERROR: ' + err.message + '\n';
  }
}

  /* ---------- 3. duplicate detection & UI ---------- */
private detectDuplicates() {
  /* ── build Map<dupKey, files[]> just like before ── */
  const map = new Map<string, FileInfo[]>();
  for (const f of this.allFiles) {
    const key = `${basename(f.fullPath).toLowerCase()}|${f.size}`;
    (map.get(key) ?? map.set(key, []).get(key)!).push(f);
  }

  // shove groups into a queue we consume later
  this.dupeQueue = Array.from(map.entries())
                        .map(([key, files]) => ({ key, files }))
                        .filter(g => g.files.length > 1); // ignore uniques

  // clear the UI and start the wizard
  const dupeArea = this.shadow.getElementById('dupeArea')!;
  dupeArea.innerHTML = '';
  this.renderNextDup();
}

private rowsForCSV(status: 'kept' | 'dropped') {
  const set  = status === 'kept' ? this.keptSet : this.droppedSet;
  return Array.from(set).map(full => ({ fullPath: full, status }));
}

// private allRowsForCSV() removed as it is not used.

private renderNextDup() {
  /* -------  finished?  ------- */
  if (this.dupeQueue.length === 0) {
    this.shadow.getElementById('dupeArea')!.innerHTML =
      '<p>All duplicates processed 🎉</p>';
    ['dlKept','dlDrop','dlAll'].forEach(id =>
      this.shadow.getElementById(id)?.removeAttribute('disabled')
    );
    return;
  }

  const group = this.dupeQueue.shift()!;           // current group
  const goodFiles = group.files;                   // no BAD_ROOT filter
  const keepArea = this.shadow.getElementById('dupeArea')!;
  keepArea.innerHTML = '';
const autoCommit = (winner: FileInfo) => {
    // similar to commitChoice but without UI
    const dropped = goodFiles.filter(f => f !== winner);
    this.keptSet.add(winner.fullPath);
    dropped.forEach(f => this.droppedSet.add(f.fullPath));

    const newPref = dirname(winner.fullPath).toLowerCase();
    if (!this.preferredRoots.has(newPref)) this.preferredRoots.add(newPref);

    this.history.push({ group, kept: [winner.fullPath], dropped: dropped.map(d=>d.fullPath),
                        newPreferred: newPref });

    this.renderNextDup();
  };

  /* -- decide if auto-keep applies -- */
  const preferred = goodFiles.filter(f =>
    isInRoot(f.fullPath, this.preferredRoots)
  );

  if (preferred.length === 1 && preferred.length !== goodFiles.length) {
    autoCommit(preferred[0]);
    return;   // jump to next group
  }

  /* -- UI: one pill per candidate -- */
  const box = document.createElement('div');
  box.className = 'dupe-group-step';

  goodFiles.forEach(f => {
    const btn = document.createElement('button');
    btn.textContent = f.fullPath;
    btn.className  = 'bin-button';
    btn.style.display = 'block';
    btn.onclick = () => commitChoice(f);
    box.appendChild(btn);
  });

  /* -- Back button if there is history -- */
  if (this.history.length) {
    const back = document.createElement('button');
    back.textContent = '⬅️ Back';
    back.className   = 'bin-button';
    back.style.marginTop = '8px';
    back.onclick = () => undoLast();
    box.appendChild(back);
  }

  keepArea.appendChild(box);

  /* ---------- helpers ---------- */
  const commitChoice = (keepFile: FileInfo) => {
    const kept: string[]    = [];
    const dropped: string[] = [];

    goodFiles.forEach(f => {
      if (f === keepFile) {
        this.keptSet.add(f.fullPath);
        kept.push(f.fullPath);
      } else {
        this.droppedSet.add(f.fullPath);
        dropped.push(f.fullPath);
      }
    });

    // learn preferred root
    const newPref = dirname(keepFile.fullPath).toLowerCase();
    const added   = this.preferredRoots.has(newPref) ? undefined : newPref;
    if (added) this.preferredRoots.add(added);

    // push to history
    this.history.push({ group, kept, dropped, newPreferred: added });

    this.renderNextDup();
  };

  const undoLast = () => {
    const last = this.history.pop();
    if (!last) return;

    // revert preferred root if it was first seen in that step
    if (last.newPreferred)
      this.preferredRoots.delete(last.newPreferred);

    // revert kept/dropped sets
    last.kept.forEach(p => this.keptSet.delete(p));
    last.dropped.forEach(p => this.droppedSet.delete(p));

    // put the group back at the front of the queue
    this.dupeQueue.unshift(last.group);

    this.renderNextDup();
    saveProgress(this);
  };
}


}

customElements.define('file-scan', FileScanPage);


function basename(fullPath: string): string {
    const parts = fullPath.replace(/\\/g, '/').split('/');
    return parts.pop() || '';
}

const STORAGE_KEY = 'trebroFileScanProgress-v1';

function saveProgress(page: FileScanPage) {
  const data = {
    roots:           page.roots,
    allFiles:        page.allFiles,
    dupeQueue:       page.dupeQueue,
    kept:            Array.from(page.keptSet),
    dropped:         Array.from(page.droppedSet),
    preferredRoots:  Array.from(page.preferredRoots),
    history:         page.history
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadProgress(): null | ReturnType<typeof JSON.parse> {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}
