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
          margin-bottom: 1rem;
        }
        .drop-zone.dragover {
          border-color: blue;
          color: black;
        }
        #chart {
          /* The SVG will be placed here */
        }
      </style>

      <div class="drop-zone" id="dropZone">
        Drag and drop your CSV/XLSX file here
      </div>
      <div id="chart"></div>
    `;
  }

  connectedCallback() {
    // Grab references to elements inside the shadow DOM
    const shadow = this.shadowRoot!;
    this.dropZone = shadow.getElementById('dropZone') as HTMLDivElement;
    this.chartContainer = shadow.getElementById('chart') as HTMLDivElement;

    // Set up drag-and-drop events
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
          const jsonData = XLSX.utils.sheet_to_json(firstSheet);
          this.renderTree(jsonData);
        } catch (err: any) {
          alert(`Error processing file: ${err.message}`);
        }
      };

      reader.onerror = () => alert('Failed to read file.');
      reader.readAsArrayBuffer(file);
    });
  }

  private renderTree(data: any[]) {
    // We'll base the width on the chartContainer's width
    const width = this.chartContainer.clientWidth || 800; // fallback
    const height = 800;
    const dx = 20;
    const dy = width / 6;

    // Convert raw data to a D3 hierarchy
    const stratify = d3.stratify<any>().id(d => d.ID).parentId(d => d.ParentID);
    const root = stratify(data);
    const treeLayout = d3.tree<any>().nodeSize([dx, dy]);

    // Create the SVG
    const svg = d3.create('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [-dy / 3, -dx, width, height]);

    // G containers for links and nodes
    const gLink = svg.append('g').attr('stroke', '#555').attr('stroke-opacity', 0.4);
    const gNode = svg.append('g');

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>().on('zoom', (event) => {
      svg.attr('transform', event.transform);
    });

    // Attach zoom
    const svgNode = svg.node();
    if (svgNode) {
      d3.select<SVGSVGElement, unknown>(svgNode).call(zoom);
    }

    // The update function
    const update = (source: d3.HierarchyPointNode<any>) => {
      // Layout the tree
      treeLayout(root);

      const nodes = root.descendants().reverse() as d3.HierarchyPointNode<any>[];
      const links = root.links();

      // JOIN for nodes
      const node = gNode.selectAll<SVGGElement, d3.HierarchyPointNode<any>>('g')
        .data(nodes, (d: d3.HierarchyPointNode<any>) => d.id!);

      // ENTER
      const nodeEnter = node.enter().append('g')
        .attr('transform', () => `translate(${source.y},${source.x})`);

      nodeEnter.append('rect')
        .attr('class', 'card')
        .attr('width', 120)
        .attr('height', 50)
        .attr('x', -60)
        .attr('y', -25)
        .attr('fill', 'white')
        .attr('stroke', '#4A90E2');

      nodeEnter.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '0.31em')
        .text(d => d.data.PartNumber || d.id);

      // UPDATE + ENTER
      nodeEnter.merge(node).transition().duration(500)
        .attr('transform', d => `translate(${d.y},${d.x})`);

      // EXIT
      node.exit().remove();

      // JOIN for links
      const linkGenerator = d3.linkHorizontal<d3.HierarchyLink<any>, d3.HierarchyPointNode<any>>()
        .x(d => d.y)
        .y(d => d.x);

      const link = gLink.selectAll<SVGPathElement, d3.HierarchyLink<any>>('path')
        .data(links);

      link.enter().append('path')
        .attr('fill', 'none')
        .attr('stroke-width', 1.5)
        .attr('stroke', '#ccc')
        .merge(link as d3.Selection<SVGPathElement, d3.HierarchyLink<any>, SVGGElement, unknown>)
        .transition().duration(500)
        .attr('d', d => linkGenerator({
          source: d.source as d3.HierarchyPointNode<any>,
          target: d.target as d3.HierarchyPointNode<any>
        }));

      link.exit().remove();
    };

    // Clear existing content, then append the new SVG
    this.chartContainer.innerHTML = '';
    this.chartContainer.appendChild(svgNode!);

    // Render initial tree
    update(root as d3.HierarchyPointNode<any>);
  }
}

// Register the custom element
customElements.define('tree-bom-page', TreeBOMPage);
