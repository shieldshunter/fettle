import * as d3 from 'd3';
import * as XLSX from 'xlsx';

export class TreeBOMPage extends HTMLElement {
  private chartContainer!: HTMLDivElement;
  private dropZone!: HTMLDivElement;

  constructor() {
    super();

    // Attach a shadow DOM (or you can skip and use this.innerHTML)
    const shadow = this.attachShadow({ mode: 'open' });

    // Provide basic HTML structure:
    shadow.innerHTML = `
      <style>
        /* Some basic styling */
        .drop-zone {
          border: 2px dashed #ccc;
          border-radius: 8px;
          padding: 12px;
          text-align: center;
          color: #666;
          transition: 0.3s;
          width: 500px;
          height: 200px;
          margin-bottom: 1rem;
        }
        .drop-zone.dragover {
          border-color: blue;
          color: black;
        }
        #chart {
          width: 100%;
          height: 600px; /* or whatever fixed height you prefer */
          overflow: disable; /* add scrollbars if content overflows */
          border: 1px solid #ccc;
        }

        #chart svg {
          width: 100%;
          height: 100%;
        }
      </style>
      <div class="drop-zone" id="dropZone">
        Drag and drop your CSV/XLSX file here
      </div>

      <div id="column-selectors" style="display:none;">
        <label for="parentSelect">Parent Column:</label>
        <select id="parentSelect"></select>

        <label for="childSelect">Child Column:</label>
        <select id="childSelect"></select>

        <button id="renderButton">Render Tree</button>
      </div>

      <div id="chart"></div>
    `;
  }

  connectedCallback() {
    const shadow = this.shadowRoot!;
    this.dropZone = shadow.getElementById('dropZone') as HTMLDivElement;
    this.chartContainer = shadow.getElementById('chart') as HTMLDivElement;
    const parentSelect = shadow.getElementById('parentSelect') as HTMLSelectElement;
    const childSelect = shadow.getElementById('childSelect') as HTMLSelectElement;
    const renderButton = shadow.getElementById('renderButton') as HTMLButtonElement;
    const columnSelectors = shadow.getElementById('column-selectors') as HTMLDivElement;
  
    let jsonData: any[] = [];
  
    this.dropZone.addEventListener('dragover', e => {
      e.preventDefault();
      this.dropZone.classList.add('dragover');
    });
  
    this.dropZone.addEventListener('dragleave', e => {
      e.preventDefault();
      this.dropZone.classList.remove('dragover');
    });
  
    this.dropZone.addEventListener('drop', e => {
      e.preventDefault();
      this.dropZone.classList.remove('dragover');
      const file = e.dataTransfer?.files[0];
  
      if (!file || (!file.name.endsWith('.xlsx') && !file.name.endsWith('.csv'))) {
        alert('Please drop a valid XLSX or CSV file.');
        return;
      }
  
      const reader = new FileReader();
      reader.onload = event => {
        try {
          const data = new Uint8Array(event.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 0, defval: '' });
  
          if (jsonData.length === 0) {
            alert("Empty file or invalid data");
            return;
          }
  
          // Populate dropdowns with column names
          const columns = Object.keys(jsonData[0]);
          parentSelect.innerHTML = childSelect.innerHTML = '';
          columns.forEach(col => {
            const option1 = document.createElement('option');
            option1.value = option1.textContent = col;
            parentSelect.appendChild(option1);
  
            const option2 = document.createElement('option');
            option2.value = option2.textContent = col;
            childSelect.appendChild(option2);
          });
  
          columnSelectors.style.display = 'block';
        } catch (err: any) {
          alert(`Error processing file: ${err.message}`);
        }
      };
  
      reader.onerror = () => alert('Failed to read file.');
      reader.readAsArrayBuffer(file);
    });
  
    renderButton.onclick = () => {
      const parentCol = parentSelect.value;
      const childCol = childSelect.value;
  
      if (parentCol === childCol) {
        alert("Parent and Child columns must be different.");
        return;
      }
  
      // Render Tree using selected columns
      this.renderTree(jsonData, parentCol, childCol);
    };
  }

  private renderTree(data: any[], parentCol: string, childCol: string) {
    const nodeWidth = 120;
    const nodeHeight = 50;
  
    let root;
    try {
      const dataWithId = data.map((d, i) => ({
        ...d,
        _uniqueId: `${d[childCol]}_${d["Pos."]}_${i}`
      }));
  
      const findParentId = (row: any) => {
        if (!row[parentCol]) return null;
        const parentRow = dataWithId.find(r => r[childCol] === row[parentCol]);
        return parentRow ? parentRow._uniqueId : null;
      };
  
      const stratify = d3.stratify<any>()
        .id(d => d._uniqueId)
        .parentId(d => findParentId(d));
  
      root = stratify(dataWithId);
    } catch (error: any) {
      alert(`Hierarchy error: ${error.message}`);
      return;
    }
  
    const treeLayout = d3.tree<any>().nodeSize([nodeWidth + 30, nodeHeight + 80]);

    treeLayout(root);

    const nodes = root.descendants();
    const links = root.links();
    
    // Compute bounding box for dynamic viewBox
    const xExtent = d3.extent(nodes, d => d.x) as [number, number];
    const yExtent = d3.extent(nodes, d => d.y) as [number, number];
    
    const padding = 50; // some padding around nodes
    const width = xExtent[1] - xExtent[0] + padding * 2;
    const height = yExtent[1] - yExtent[0] + padding * 2;
    
    // Create SVG with dynamic viewBox
    const svg = d3.create('svg')
      .attr('viewBox', [xExtent[0] - padding, yExtent[0] - padding, width, height].join(' '))
      .attr('preserveAspectRatio', 'xMidYMid meet'); // Keeps aspect ratio intact
    
    const gLink = svg.append('g').attr('stroke', '#555').attr('stroke-opacity', 0.4);
    const gNode = svg.append('g');
    
    // Append zoom correctly:
    svg.call(
      d3.zoom<SVGSVGElement, unknown>().on('zoom', (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
        const { transform } = event;
        gNode.attr('transform', transform.toString());
        gLink.attr('transform', transform.toString());
      }) as any
    );

    const node = gNode.selectAll('g')
      .data(nodes, (d: any) => d.id!)
      .enter().append('g')
      .attr('transform', d => `translate(${d.x},${d.y})`);
  
    node.append('rect')
      .attr('width', nodeWidth)
      .attr('height', nodeHeight)
      .attr('x', -nodeWidth / 2)
      .attr('y', -nodeHeight / 2)
      .attr('fill', 'white')
      .attr('stroke', '#4A90E2');
  
    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.31em')
      .text(d => {
        const text = d.data[childCol] || d.id;
        return text.length > 15 ? text.slice(0, 12) + '...' : text;
      });
  
    const linkGenerator = d3.linkVertical<d3.HierarchyPointLink<any>, d3.HierarchyPointNode<any>>()
      .x(d => d.x)
      .y(d => d.y);
  
    gLink.selectAll('path')
      .data(links)
      .enter().append('path')
      .attr('fill', 'none')
      .attr('stroke-width', 1.5)
      .attr('stroke', '#ccc')
      .attr('d', d => {
        if (d.source.x !== undefined && d.source.y !== undefined && d.target.x !== undefined && d.target.y !== undefined) {
          return linkGenerator(d as d3.HierarchyPointLink<any>);
        }
        return null;
      });
  
    this.chartContainer.innerHTML = '';
    this.chartContainer.appendChild(svg.node()!);
  }
  
  
}

// Register the custom element
customElements.define('tree-bom-page', TreeBOMPage);
