'use client';

import { useState } from 'react';

const crystalPlanes = {
  '100': {
    title: '[100] Plane',
    description:
      'Looking directly down the face of the cube. The structure appears as a square grid. Notice the subtle checkerboard pattern where columns of pure Iron alternate with columns containing both Iron and Silicon.'
  },
  '110': {
    title: '[110] Plane',
    description:
      'The most defining view. Looking diagonally through the cube creates a rectangular grid. It clearly separates the elements, showing distinct heavy columns of pure Iron alternating with ordered Iron-Silicon "Bits".'
  },
  '111': {
    title: '[111] Plane',
    description:
      'Looking down the body diagonal. The projection flattens into a complex hexagonal mosaic. This visually merges the heavy physical "Atoms" and the glowing digital "Bits" into an intricate, tightly woven network.'
  }
} as const;

const comparatorRows = [
  {
    id: 'weight',
    name: 'Atomic Weight',
    fe: '55.845 u',
    si: '28.085 u'
  },
  {
    id: 'number',
    name: 'Atomic Number',
    fe: '26',
    si: '14'
  },
  {
    id: 'crystal',
    name: 'Crystal Structure',
    fe: 'Body-Centered Cubic (Dense/Robust)',
    si: 'Diamond Cubic (Ordered/Brittle)'
  },
  {
    id: 'density',
    name: 'Density',
    fe: '7.87 g/cm³',
    si: '2.33 g/cm³'
  },
  {
    id: 'melt',
    name: 'Melting Point',
    fe: '1,538 °C',
    si: '1,414 °C'
  },
  {
    id: 'conductivity',
    name: 'Electrical Role',
    fe: 'High Conductor (Wires, Motors)',
    si: 'Semiconductor (Transistors, Logic)'
  },
  {
    id: 'magnetic',
    name: 'Magnetic Properties',
    fe: 'Ferromagnetic (Permanent magnets)',
    si: 'Diamagnetic (Repels fields)'
  },
  {
    id: 'industry',
    name: 'Core Industry',
    fe: 'Heavy Manufacturing, Construction, Robotics',
    si: 'Electronics, AI, Edge Computing'
  }
] as const;

type Plane = keyof typeof crystalPlanes;

function CrystalProjection({ plane }: { plane: Plane }) {
  const is110 = plane === '110';
  const is111 = plane === '111';

  const nodes = Array.from({ length: is111 ? 66 : 70 }, (_, index) => {
    const cols = is110 ? 10 : is111 ? 11 : 10;
    const row = Math.floor(index / cols);
    const col = index % cols;
    const baseX = 54 + col * (is110 ? 44 : is111 ? 40 : 42);
    const baseY = 52 + row * (is110 ? 34 : is111 ? 34 : 36);
    const offsetX = is111 && row % 2 !== 0 ? 20 : 0;
    const offsetY = is110 && col % 2 !== 0 ? 17 : 0;
    const silicon = is111 ? (row + col) % 3 === 0 : col % 2 !== 0 && row % 2 !== 0;

    return {
      id: `${row}-${col}`,
      x: baseX + offsetX,
      y: baseY + offsetY,
      r: silicon ? 7 : 10,
      silicon
    };
  });

  return (
    <svg viewBox="0 0 520 360" className="h-full w-full" aria-hidden>
      <defs>
        <radialGradient id="siliconGlow" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#f5ffff" />
          <stop offset="55%" stopColor="#9ee9ef" />
          <stop offset="100%" stopColor="#5fa7b1" />
        </radialGradient>
        <radialGradient id="ironCore" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#e5ebee" />
          <stop offset="55%" stopColor="#98a7b0" />
          <stop offset="100%" stopColor="#55636c" />
        </radialGradient>
      </defs>
      <rect x="1" y="1" width="518" height="358" rx="28" fill="rgba(6,11,15,0.72)" stroke="rgba(255,255,255,0.08)" />
      {nodes.map((node) => (
        <g key={node.id}>
          {node.silicon ? <circle cx={node.x} cy={node.y} r={node.r * 2.3} fill="rgba(95,167,177,0.12)" /> : null}
          <circle cx={node.x} cy={node.y} r={node.r} fill={node.silicon ? 'url(#siliconGlow)' : 'url(#ironCore)'} />
        </g>
      ))}
    </svg>
  );
}

export function MaterialThesis() {
  const [plane, setPlane] = useState<Plane>('110');
  const [visibleRows, setVisibleRows] = useState<string[]>(['weight', 'number', 'crystal', 'conductivity', 'industry']);

  function toggleRow(id: string) {
    setVisibleRows((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  const activeRows = comparatorRows.filter((row) => visibleRows.includes(row.id));

  return (
    <section>
      <div className="grid gap-6 lg:grid-cols-[1.05fr,0.95fr]">
        <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(12,20,25,0.95),rgba(8,13,17,0.92))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.24)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-muted">The Fe₃Si Intersection</p>
              <h3 className="mt-3 font-display text-2xl text-white">Atoms meet logic</h3>
            </div>
            <div className="flex gap-2">
              {(Object.keys(crystalPlanes) as Plane[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setPlane(item)}
                  className={plane === item ? 'rounded-full border border-primary bg-primary px-4 py-2 text-xs uppercase tracking-[0.25em] text-slate-950' : 'rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.25em] text-muted transition hover:border-white/25 hover:text-white'}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-6 aspect-[26/18] overflow-hidden rounded-[1.5rem]">
            <CrystalProjection plane={plane} />
          </div>
          <div className="mt-5 space-y-3 text-sm text-muted">
            <p>
              FerSil exists at the compound interface (Fe₃Si), where the tangible constraints of heavy industry and physical hardware meet computational logic and artificial intelligence.
            </p>
            <p>
              Suessite, a naturally occurring Fe₃Si mineral, was named for Austrian-American cosmochemist Hans Suess. Our platform mirrors that transatlantic arc—connecting European technical depth with global market execution.
            </p>
          </div>
          <div className="mt-5 flex flex-wrap gap-4 text-sm text-muted">
            <span className="inline-flex items-center gap-2">
              <span className="h-3.5 w-3.5 rounded-full bg-[#8b98a1]" />
              Iron (Fe) - &quot;Atoms&quot;
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-[#9ee9ef] shadow-[0_0_12px_rgba(94,191,204,0.7)]" />
              Silicon (Si) - &quot;Bits&quot;
            </span>
          </div>
          <p className="mt-5 text-sm text-muted">{crystalPlanes[plane].description}</p>
        </div>

        <div className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-[0_24px_80px_rgba(4,12,18,0.16)]">
          <p className="text-xs uppercase tracking-[0.32em] text-slate-500">Material Comparator</p>
          <h3 className="mt-3 font-display text-2xl text-slate-950">Iron and silicon in one frame</h3>
          <p className="mt-3 max-w-2xl text-sm !text-slate-600">Select attributes to compare the physical and digital foundations.</p>
          <div className="mt-4 rounded-[1.25rem] bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
            <p className="!text-slate-600">
              FerSil invests where physical intelligence and AI converge. The CEE region continues to produce deep-tech, robotics, and engineering talent; the U.S. ecosystem contributes scale, software reach, and market velocity. We back founders building across that corridor.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            {comparatorRows.map((row) => {
              const active = visibleRows.includes(row.id);
              return (
                <button
                  key={row.id}
                  type="button"
                  onClick={() => toggleRow(row.id)}
                  className={active ? 'rounded-full border border-slate-900 bg-slate-900 px-3 py-2 text-xs uppercase tracking-[0.2em] text-white' : 'rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs uppercase tracking-[0.2em] text-slate-500 transition hover:border-slate-300 hover:text-slate-900'}
                >
                  {row.name}
                </button>
              );
            })}
          </div>
          <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-slate-200">
            <div className="grid grid-cols-[1.15fr,1fr,1fr] bg-slate-950 px-5 py-4 text-sm uppercase tracking-[0.25em] text-slate-400">
              <div>Attribute</div>
              <div className="text-center text-slate-200">Iron</div>
              <div className="text-center text-[#2f8f9c]">Silicon</div>
            </div>
            <div className="divide-y divide-slate-200 bg-white">
              {activeRows.map((row) => (
                <div key={row.id} className="grid grid-cols-[1.15fr,1fr,1fr] items-stretch text-sm">
                  <div className="border-r border-slate-200 bg-slate-50 px-5 py-4 font-medium text-slate-700">{row.name}</div>
                  <div className="border-r border-slate-200 px-5 py-4 text-slate-900">{row.fe}</div>
                  <div className="px-5 py-4 text-slate-900">{row.si}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
