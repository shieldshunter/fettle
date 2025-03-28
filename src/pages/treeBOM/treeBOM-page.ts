import * as d3 from 'd3';
import * as XLSX from 'xlsx';

export class TreeBOMPage extends HTMLElement {
  private chartContainer!: HTMLDivElement;
  private tooltipContainer!: HTMLDivElement;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });

    shadow.innerHTML = `
      <style>
        #container { display: flex; }
        #settings { width: 300px; padding-right: 10px; }
        #tooltipContainer {
          flex: 1;
          border: 1px solid #ddd;
          padding: 10px;
          min-height: 100px;
          background: #f9f9f9;
          overflow-y: auto;
          opacity: 1;
          transition: opacity 0.1s ease-in-out;
        }
        #chart { width: 100%; height: 600px; border: 1px solid #ccc; margin-top: 10px; }
        #chart svg { width: 100%; height: 100%; }
      </style>

      <div id="container">
        <div id="settings">
          <input type="file" id="fileUpload" accept=".xlsx, .csv" />
          <button id="retryUpload">🔄 Retry</button>

          <div id="column-selectors" style="display:none;">
            <label>Parent Column:</label>
            <select id="parentSelect"></select>
            <label>Child Column:</label>
            <select id="childSelect"></select>
            <button id="renderButton">Render Tree</button>

            <div>
              <label>Tooltip Fields (Ctrl+Click for multiple):</label>
              <select id="tooltipFields" multiple style="height:100px;width:200px;"></select>
            </div>
          </div>
        </div>

        <div id="tooltipContainer">Hover a node to see details here.</div>
      </div>

      <div id="chart"></div>
    `;
  }

  connectedCallback() {
    const shadow = this.shadowRoot!;
    const fileUpload = shadow.getElementById('fileUpload') as HTMLInputElement;
    const retryUpload = shadow.getElementById('retryUpload') as HTMLButtonElement;
    const parentSelect = shadow.getElementById('parentSelect') as HTMLSelectElement;
    const childSelect = shadow.getElementById('childSelect') as HTMLSelectElement;
    const renderButton = shadow.getElementById('renderButton') as HTMLButtonElement;
    const columnSelectors = shadow.getElementById('column-selectors') as HTMLDivElement;
    const tooltipFields = shadow.getElementById('tooltipFields') as HTMLSelectElement;
    this.chartContainer = shadow.getElementById('chart') as HTMLDivElement;
    this.tooltipContainer = shadow.getElementById('tooltipContainer') as HTMLDivElement;

    let jsonData: any[] = [];

    retryUpload.onclick = () => {
      fileUpload.value = '';
      columnSelectors.style.display = 'none';
      this.chartContainer.innerHTML = '';
      this.tooltipContainer.textContent = 'Hover a node to see details here.';
      jsonData = [];
    };

    fileUpload.onchange = () => {
      const file = fileUpload.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = event => {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 0, defval: '' });

        const columns = Object.keys(jsonData[0]);
        parentSelect.innerHTML = childSelect.innerHTML = tooltipFields.innerHTML = '';

        columns.forEach(col => {
          [parentSelect, childSelect, tooltipFields].forEach(select => {
            const opt = document.createElement('option');
            opt.value = opt.textContent = col;
            select.appendChild(opt.cloneNode(true));
          });
        });

        columnSelectors.style.display = 'block';
      };
      reader.readAsArrayBuffer(file);
    };

    renderButton.onclick = () => {
      const parentCol = parentSelect.value;
      const childCol = childSelect.value;
      const tooltipSelections = Array.from(tooltipFields.selectedOptions).map(o => o.value);

      if (parentCol === childCol) {
        alert("Parent and Child columns must be different.");
        return;
      }

      this.renderTree(jsonData, parentCol, childCol, tooltipSelections);
    };
  }

  private renderTree(data: any[], parentCol: string, childCol: string, tooltipSelections: string[]) {
    interface TreeNodeData {
      [key: string]: any;
      nodeCount?: number;
    }

    const root = d3.stratify<TreeNodeData>()
      .id((d, i) => `${d[childCol]}_${i}`)
      .parentId(d => data.find(p => p[childCol] === d[parentCol]) ? `${d[parentCol]}_${data.indexOf(data.find(p => p[childCol] === d[parentCol]))}` : null)(data);

    const treeLayout = d3.tree().nodeSize([160, 100]);
    treeLayout(root as d3.HierarchyNode<unknown>);

    root.eachAfter(d => d.data.nodeCount = d.children ? d.children.reduce((a, c) => a + (c.data.nodeCount || 0), 0) + d.children.length : 0);
    const colorScale = d3.scaleSequential(d3.interpolateRdYlGn).domain([d3.max(root.descendants(), d => d.data.nodeCount) || 1, 0]);

    const svg = d3.create('svg').attr('viewBox', [-1000, -500, 2000, 2000]);
    const g = svg.append('g');

    svg.call(
      d3.zoom<SVGSVGElement, unknown>().on('zoom', (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
        const { transform } = event;
        g.attr('transform', transform.toString());
        // Removed undefined gLink reference
      }) as any
    );

    g.selectAll('path')
      .data(root.links())
      .enter().append('path')
      .attr('fill', 'none').attr('stroke', '#ccc')
      .attr('d', d3.linkVertical<d3.HierarchyLink<TreeNodeData>, [number, number]>()
        .source(d => [d.source.x!, d.source.y!])
        .target(d => [d.target.x!, d.target.y!]));
  

      const node = g.selectAll('g').data(root.descendants()).enter().append('g')
      .attr('transform', d => `translate(${d.x},${d.y})`)
      .style('cursor', 'pointer')
      .on('mouseover', (event, d) => {
        // Smooth Tooltip Content Update
        d3.select(this.tooltipContainer)
          .transition().duration(200)
          .style('opacity', 0)
          .on('end', () => {
            this.tooltipContainer.innerHTML = tooltipSelections.map(f => `<strong>${f}</strong>: ${d.data[f]}`).join('<br>');
            d3.select(this.tooltipContainer)
              .transition().duration(200)
              .style('opacity', 1);
          });
    
        // Highlight hovered node
        d3.select(event.currentTarget).select('rect')
          .transition().duration(200)
          .attr('stroke-width', 3)
          .attr('stroke', '#555');
      })
      .on('mouseout', (event, _) => {
        // Reset highlight
        d3.select(event.currentTarget).select('rect')
          .transition().duration(200)
          .attr('stroke-width', 1)
          .attr('stroke', '#333');
      });
      

    node.append('rect').attr('width', 120).attr('height', 50)
          .attr('x', -60).attr('y', -25)
          .attr('fill', d => colorScale(d.data.nodeCount ?? 0)).attr('stroke', '#333');

    node.append('text').attr('text-anchor', 'middle').attr('dy', '.35em')
      .text(d => String(d.data[childCol]).slice(0, 15));

    this.chartContainer.innerHTML = '';
    this.chartContainer.append(svg.node()!);
  }
}

customElements.define('tree-bom-page', TreeBOMPage);
