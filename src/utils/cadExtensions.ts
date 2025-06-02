// src/utils/cadExtensions.ts
export type CadGroup = {
  label: string;
  groups: { label: string; exts: string[] }[];
};

export const CAD_GROUPS: CadGroup[] = [
  {
    label: 'AutoCAD',
    groups: [
      { label: 'Native',        exts: ['dwg'] },
      { label: 'Exchange',      exts: ['dxf'] },
      { label: 'Other',         exts: ['dwf','dwt','lin','pat','dim'] },
    ],
  },
  {
    label: 'SolidWorks',
    groups: [
      { label: 'Native',        exts: ['sldprt','sldasm'] },
      { label: 'Import/Export', exts: ['step','stp','iges','stl','pdf'] },
    ],
  },
  {
    label: 'CATIA',
    groups: [
      { label: 'Native',        exts: ['CATPart','CATProduct','3DXML'] },
      { label: 'Import/Export', exts: ['step','iges','stl','pdf'] },
    ],
  },
  {
    label: 'NX',
    groups: [
      { label: 'Native',        exts: ['prt'] },               // case-insensitive anyway
      { label: 'Import/Export', exts: ['step','iges','stl','pdf'] },
    ],
  },
  {
    label: 'Creo',
    groups: [
      { label: 'Native',        exts: ['prt','asm'] },
      { label: 'Import/Export', exts: ['step','iges','stl','pdf'] },
    ],
  },
  {
    label: 'Inventor',
    groups: [
      { label: 'Native',        exts: ['ipt','iam'] },
      { label: 'Import/Export', exts: ['step','iges','stl','pdf'] },
    ],
  },
  {
    label: 'Solid Edge',
    groups: [
      { label: 'Native',        exts: ['par','asm'] },
      { label: 'Import/Export', exts: ['step','iges','stl','pdf'] },
    ],
  },
  {
    label: 'Rhino',
    groups: [
      { label: 'Native',        exts: ['3dm'] },
      { label: 'Import/Export', exts: ['step','iges','stl','pdf'] },
    ],
  },
  {
    label: 'SketchUp',
    groups: [
      { label: 'Native',        exts: ['skp'] },
      { label: 'Import/Export', exts: ['step','iges','stl','pdf'] },
    ],
  },
  {
    label: 'Neutral Formats',
    groups: [
      { label: 'Exchange', exts: ['step','stp','iges','stl','dxf','pdf'] },
    ],
  },
];
