import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { GTAOPass } from "three/addons/postprocessing/GTAOPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

/*
 * Personaje voxel de Paul Zaruma, construido bloque a bloque con Three.js.
 * Es el mismo modelo que `animaciones/paul-personaje-3d .html`, adaptado para
 * vivir dentro de un contenedor de la página (fondo transparente, sin zoom con
 * la rueda para no bloquear el scroll, y se pausa cuando no está en pantalla).
 */

export type PaulAction = "idle" | "wave" | "bye" | "tpose" | "thumbs" | "dance" | "jump";
/** Momentos en los que habla: clic, despedida al bajar y saludo al volver arriba. */
export type PaulSay = "click" | "bye" | "hello";

export interface PaulSceneOptions {
  /** Elemento donde se inserta el canvas (define el tamaño del render). */
  host: HTMLElement;
  /**
   * Elemento que recibe arrastre (girar) y clic (saludar). Mientras habla se le
   * escriben --say-x / --say-y (junto a la boca), --say-room (ancho libre a la derecha)
   * y --say-shift (cuánto correr el globo a la izquierda si no cabe).
   */
  interaction: HTMLElement;
  /** Familias CSS para el estampado de la camiseta. */
  fonts: { slab: string; sans: string };
  onReady?: () => void;
  /** Mostrar el globo de diálogo (o esconderlo con null). */
  onSay?: (kind: PaulSay | null) => void;
}

export interface PaulScene {
  play(name: PaulAction): void;
  dispose(): void;
}

type Pose = Record<string, number>;
type MatKey = "std" | "skin" | "hair" | "frame" | "lens" | "print";
type Face = "pz" | "nz" | "px" | "nx" | "py" | "ny";
type Axis = "x" | "y" | "z";
type UVFn = (x: number, y: number, z: number) => [number, number];

interface BoxOpts {
  r?: number;
  seg?: number;
  mat?: MatKey;
  jit?: number;
  uv?: UVFn;
}

interface BrickOpts {
  faces: Face[];
  color: string[] | ((f: Face, u: number, v: number, row: number) => string);
  emb?: number;
  rowH?: [number, number];
  bw?: [number, number];
  prot?: (f: Face, u: number, v: number, row: number) => number;
  skip?: (f: Face, ua: number, ub: number, va: number, vb: number) => boolean;
  mat?: MatKey;
  uv?: UVFn;
  jit?: number;
  r?: number;
}

const D = THREE.MathUtils.degToRad;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (v: number) => {
  v = clamp01(v);
  return v * v * (3 - 2 * v);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// Generador pseudoaleatorio con semilla: el personaje sale idéntico en cada carga.
function mulberry32(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ------------------------------------------------------------------ *
 *  Paleta (tomada de las referencias)
 * ------------------------------------------------------------------ */
const C = {
  skin: "#f3c48b", skinLight: "#f7d3a0", earIn: "#d99456", neck: "#e9ad70",
  hair: ["#1c2135", "#20263b", "#181d2e", "#252c43", "#1e2338"],
  white: ["#f5f7fa", "#eef2f6", "#f8fafc", "#e8edf3", "#f2f5f8"],
  yellow: "#f5b52a",
  jeans: ["#1858c0", "#1c61c9", "#1450b4", "#2269cf", "#0f45a6", "#2a76d6", "#0d3d98", "#1858c0"],
  cuff: ["#1449b0", "#1752bc", "#103f9c"],
  waist: ["#1d5ac4", "#1a55bd", "#2162c9"],
  shoe: "#f7f8fa", sole: "#c6cbd2", red: "#e1262d", laceSlot: "#5c626b",
  frame: "#f4a62a", frameDark: "#d9861c", temple: "#a87440", bridge: "#b98245",
  mouth: "#5b2721", teeth: "#f8f6f0", tongue: "#b8665c", band: "#14181f", crease: "#c98a52",
};
const lensRows = [
  ["#f9c531", "#fbcc35", "#fac332", "#f8bb2e", "#f6b22c"],
  ["#f39a45", "#ef8a4c", "#f29a3e", "#f5a43a", "#f29233"],
  ["#e62f8c", "#e9327a", "#ef405c", "#f24c3f", "#f05c2f"],
  ["#5d3fa3", "#6c3f8d", "#813f63", "#a64b2e", "#c45b1f"],
];

/* ------------------------------------------------------------------ *
 *  Construcción del modelo
 * ------------------------------------------------------------------ */
function buildCharacter() {
  const R = mulberry32(7310);
  const rand = (a: number, b: number) => a + (b - a) * R();
  const pick = <T,>(arr: T[]): T => arr[Math.floor(R() * arr.length)];

  // Esqueleto: cada articulación tiene su pivote en coordenadas del mundo
  // (pose de reposo = pose T). La geometría se escribe en coordenadas del mundo.
  const J: Record<string, THREE.Group> = {};
  const pivots = new Map<string, THREE.Vector3>();
  const parts = new Map<string, Map<MatKey, THREE.BufferGeometry[]>>();
  const joint = (name: string, parent: string | null, x: number, y: number, z: number) => {
    const g = new THREE.Group();
    g.name = name;
    pivots.set(name, new THREE.Vector3(x, y, z));
    parts.set(name, new Map());
    if (parent) {
      const p = pivots.get(parent)!;
      g.position.set(x - p.x, y - p.y, z - p.z);
      J[parent].add(g);
    } else g.position.set(x, y, z);
    J[name] = g;
  };
  joint("root", null, 0, 0, 0);
  joint("hips", "root", 0, 31, 0);
  joint("torso", "hips", 0, 35, 0);
  joint("head", "torso", 0, 61.2, -0.6);
  for (const [S, s] of [["L", 1], ["R", -1]] as const) {
    joint("shoulder" + S, "torso", s * 18.4, 55.6, 0);
    joint("elbow" + S, "shoulder" + S, s * 25.0, 55.6, 0);
    joint("hand" + S, "elbow" + S, s * 34.0, 55.6, 0);
    joint("leg" + S, "hips", s * 6.0, 29, 0);
    joint("knee" + S, "leg" + S, s * 6.0, 18, 0);
    joint("foot" + S, "knee" + S, s * 6.0, 7.4, 0);
  }
  for (const k of ["shoulderL", "shoulderR", "elbowL", "elbowR", "handL", "handR"]) J[k].rotation.order = "ZYX";

  // Bloques: cajas biseladas que se fusionan por hueso y material
  const geoCache = new Map<string, RoundedBoxGeometry>();
  const col = new THREE.Color();
  const box = (jn: string, x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, color: string, o: BoxOpts = {}) => {
    if (x0 > x1) [x0, x1] = [x1, x0];
    if (y0 > y1) [y0, y1] = [y1, y0];
    if (z0 > z1) [z0, z1] = [z1, z0];
    const pv = pivots.get(jn)!;
    const w = x1 - x0, h = y1 - y0, d = z1 - z0;
    const r = Math.max(0.02, Math.min(o.r ?? 0.24, Math.min(w, h, d) * 0.22));
    const seg = o.seg ?? 1;
    const key = `${w.toFixed(3)}|${h.toFixed(3)}|${d.toFixed(3)}|${seg}|${r.toFixed(3)}`;
    let base = geoCache.get(key);
    if (!base) {
      base = new RoundedBoxGeometry(w, h, d, seg, r);
      geoCache.set(key, base);
    }
    const g = base.clone();
    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, cz = (z0 + z1) / 2;
    if (o.uv) {
      const pos = g.attributes.position, uv = g.attributes.uv;
      for (let i = 0; i < pos.count; i++) {
        const [u, v] = o.uv(cx + pos.getX(i), cy + pos.getY(i), cz + pos.getZ(i));
        uv.setXY(i, u, v);
      }
    }
    g.translate(cx - pv.x, cy - pv.y, cz - pv.z);
    col.set(color);
    if (o.jit) col.offsetHSL(0, 0, (R() - 0.5) * o.jit);
    const n = g.attributes.position.count, arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      arr[i * 3] = col.r;
      arr[i * 3 + 1] = col.g;
      arr[i * 3 + 2] = col.b;
    }
    g.setAttribute("color", new THREE.BufferAttribute(arr, 3));
    const m = parts.get(jn)!;
    const mat = o.mat ?? "std";
    if (!m.has(mat)) m.set(mat, []);
    m.get(mat)!.push(g);
  };

  const defProt = () => {
    const r = R();
    return r < 0.6 ? rand(0.04, 0.1) : r < 0.9 ? rand(0.15, 0.32) : rand(0.38, 0.62);
  };

  // Recubre las caras de una caja con "ladrillos" de alturas y relieves distintos
  const bricks = (jn: string, b: [number, number, number, number, number, number], o: BrickOpts) => {
    const [x0, x1, y0, y1, z0, z1] = b;
    const emb = o.emb ?? 0.45;
    const rowH = o.rowH ?? [1.3, 2.2], bw = o.bw ?? [2.0, 4.2];
    for (const f of o.faces) {
      const spec: Record<Face, [Axis, number, number, Axis, Axis, number, number, number, number]> = {
        pz: ["z", 1, z1, "x", "y", x0, x1, y0, y1],
        nz: ["z", -1, z0, "x", "y", x0, x1, y0, y1],
        px: ["x", 1, x1, "z", "y", z0, z1, y0, y1],
        nx: ["x", -1, x0, "z", "y", z0, z1, y0, y1],
        py: ["y", 1, y1, "x", "z", x0, x1, z0, z1],
        ny: ["y", -1, y0, "x", "z", x0, x1, z0, z1],
      };
      const [ax, sg, plane, uAx, vAx, u0, u1, v0, v1] = spec[f];
      let va = v0, row = 0;
      while (va < v1 - 0.05) {
        let h = rand(rowH[0], rowH[1]);
        if (v1 - (va + h) < rowH[0] * 0.6) h = v1 - va;
        let ua = u0, first = true;
        while (ua < u1 - 0.05) {
          let w = rand(bw[0], bw[1]);
          if (first) {
            w *= rand(0.35, 1);
            first = false;
          }
          if (u1 - (ua + w) < bw[0] * 0.5) w = u1 - ua;
          const uc = ua + w / 2, vc = va + h / 2;
          if (!(o.skip && o.skip(f, ua, ua + w, va, va + h))) {
            const p = o.prot ? o.prot(f, uc, vc, row) : defProt();
            const c = {} as Record<Axis, [number, number]>;
            c[uAx] = [ua, ua + w];
            c[vAx] = [va, va + h];
            c[ax] = sg > 0 ? [plane - emb, plane + p] : [plane - p, plane + emb];
            const color = typeof o.color === "function" ? o.color(f, uc, vc, row) : pick(o.color);
            box(jn, c.x[0], c.x[1], c.y[0], c.y[1], c.z[0], c.z[1], color, { mat: o.mat, uv: o.uv, jit: o.jit ?? 0.015, r: o.r ?? 0.1 });
          }
          ua += w;
        }
        va += h;
        row++;
      }
    }
  };

  /* ---------------- CABEZA (barbilla en y=0, cara mirando a +z) ---------------- */
  const HY = 66;
  const H = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, c: string, o: BoxOpts = {}) =>
    box("head", x0, x1, y0 + HY, y1 + HY, z0, z1, c, { seg: 2, r: 0.35, ...o });
  const HM = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, c: string, o: BoxOpts) => {
    H(x0, x1, y0, y1, z0, z1, c, o);
    H(-x1, -x0, y0, y1, z0, z1, c, o);
  };

  // Cuello
  box("head", -4.7, 4.7, 59.4, 68.0, -5.2, 3.4, C.neck, { seg: 2, r: 0.4, mat: "skin" });
  // Cráneo y quijada: la cara se estrecha hacia abajo en dos escalones
  H(-11, 11, 4.4, 23.6, -11, 9.7, C.skin, { mat: "skin", r: 0.6 });
  H(-9.7, 9.7, 2.2, 4.45, -6.5, 9.7, "#efbe85", { mat: "skin", r: 0.35 });
  H(-7.6, 7.6, 0, 2.25, -3.5, 10.4, "#edba81", { mat: "skin", r: 0.4 });
  // Placa frontal de la cara en bloques grandes con leves variaciones de tono
  for (const [a, b, c] of [[-11, -5.2, C.skinLight], [-5.2, 0.4, "#f6d09b"], [0.4, 5.8, C.skinLight], [5.8, 11, "#f5cf9a"]] as const)
    H(a, b, 14.8, 20.2, 9.6, 10.5, c, { mat: "skin", r: 0.14 });
  for (const [a, b, c] of [[-11, -3.7, C.skin], [-3.7, 3.7, "#f4c890"], [3.7, 11, "#f1c389"]] as const)
    H(a, b, 5.6, 14.8, 9.6, 10.5, c, { mat: "skin", r: 0.14 });
  // Mejillas alrededor de la boca: mismo tono y casi sin bisel para que no se vean juntas
  const cheek = "#efbe85", flat: BoxOpts = { mat: "skin", r: 0.03, seg: 1 };
  H(-11, -3.3, 4.4, 5.65, 9.6, 10.5, cheek, flat);
  H(3.3, 11, 4.4, 5.65, 9.6, 10.5, cheek, flat);
  H(-9.7, -2.7, 3.0, 4.45, 9.6, 10.5, cheek, flat);
  H(2.7, 9.7, 3.0, 4.45, 9.6, 10.5, cheek, flat);
  H(-9.7, 9.7, 2.2, 3.05, 9.6, 10.5, cheek, flat);
  // Boca abierta: hueco oscuro, dientes arriba y lengua abajo
  H(-3.3, 3.3, 3.0, 5.6, 8.9, 9.75, C.mouth, { mat: "skin", r: 0.12 });
  H(-1.4, 2.2, 4.55, 5.6, 8.9, 10.15, C.teeth, { mat: "skin", r: 0.18 });
  H(-2.3, 2.3, 3.0, 3.55, 8.9, 9.95, C.tongue, { mat: "skin", r: 0.15 });
  // Nariz
  H(-1.0, 1.0, 8.4, 11.6, 10.3, 11.8, "#f7d7a6", { mat: "skin", r: 0.3 });
  H(-1.3, 1.3, 6.5, 8.6, 10.3, 12.6, "#f6d29f", { mat: "skin", r: 0.38 });
  // Orejas
  HM(10.6, 13.3, 5.6, 12.3, -4.0, -0.5, "#f2c78f", { mat: "skin", r: 0.4 });
  HM(13.1, 13.55, 6.6, 10.8, -3.2, -1.5, C.earIn, { mat: "skin", r: 0.12 });
  HM(13.1, 13.65, 10.8, 11.7, -3.5, -0.9, "#f5cd96", { mat: "skin", r: 0.12 });
  // Gafas: montura naranja + mosaico de 5×4 "píxeles" en degradado atardecer
  for (const c of [-6.0, 6.0]) {
    H(c - 4.4, c + 4.4, 8.1, 14.6, 10.7, 11.5, C.frameDark, { mat: "frame", r: 0.3 });
    H(c - 2.7, c + 2.7, 6.6, 8.3, 10.7, 11.5, C.frameDark, { mat: "frame", r: 0.3 });
    H(c - 4.4, c + 4.4, 12.85, 14.6, 10.7, 12.95, "#f7b434", { mat: "frame", r: 0.45 });
    H(c - 4.4, c - 3.75, 8.2, 12.95, 10.7, 12.9, C.frame, { mat: "frame", r: 0.22 });
    H(c + 3.75, c + 4.4, 8.2, 12.95, 10.7, 12.9, C.frame, { mat: "frame", r: 0.22 });
    H(c - 3.8, c + 3.8, 8.15, 12.85, 11.3, 12.55, "#ffffff", { mat: "lens", r: 0.18, uv: (x, y) => [(x - (c - 3.8)) / 7.6, (y - HY - 6.6) / 6.25] });
    // fila de abajo (morado → marrón) más estrecha, como en la referencia
    H(c - 2.6, c + 2.6, 6.6, 8.25, 11.3, 12.55, "#ffffff", { mat: "lens", r: 0.3, uv: (x, y) => [(x - (c - 2.6)) / 5.2, (y - HY - 6.6) / 6.25] });
  }
  H(-1.75, 1.75, 11.9, 12.9, 11.0, 12.0, C.bridge, { mat: "frame", r: 0.25 });
  HM(10.2, 11.6, 12.0, 13.0, 10.7, 12.0, C.temple, { mat: "frame", r: 0.25 });
  HM(11.0, 11.75, 12.0, 13.0, -2.6, 11.2, C.temple, { mat: "frame", r: 0.2 });

  // Pelo: masa base + mechones en capas
  const HH = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, c?: string) =>
    H(x0, x1, y0, y1, z0, z1, c ?? pick(C.hair), { mat: "hair", r: 0.2, seg: 1 });
  HH(-11.8, 11.8, 20.0, 26.0, -12.0, 10.9, C.hair[0]);
  HH(-11.6, 9.4, 20.1, 23.8, 8.4, 11.3, C.hair[1]);   // base continua del flequillo
  HH(8.0, 12.2, 17.2, 21.4, 6.0, 11.3, C.hair[0]);    // sienes: sin piel asomando
  HH(-12.2, -9.0, 18.0, 21.4, 6.0, 11.0, C.hair[0]);
  HH(-11.8, 11.8, 7.0, 21.0, -12.2, -6.0, C.hair[0]);
  for (const s of [1, -1]) {
    HH(s * 10.6, s * 12.0, 13.0, 21.0, -12.0, 4.0, C.hair[0]);
    HH(s * 10.6, s * 12.0, 7.0, 13.0, -12.0, -3.8, C.hair[0]);
    HH(s * 10.6, s * 11.9, 7.4, 12.0, -0.6, 9.4, C.hair[1]); // patilla: de la oreja hasta las gafas
  }
  // Flequillo frontal
  HH(-14.0, -8.6, 16.4, 21.6, 3.5, 11.0);
  HH(-12.0, -10.4, 14.9, 17.4, 2.5, 9.5);
  HH(-9.2, -1.6, 19.8, 23.2, 8.0, 12.2);
  HH(-2.2, 4.4, 20.4, 23.6, 8.0, 11.8);
  HH(3.6, 8.6, 17.8, 21.6, 7.5, 11.6);
  HH(7.6, 12.4, 14.8, 19.0, 4.5, 11.0);
  HH(9.6, 12.6, 13.1, 16.6, 1.0, 8.0);
  // Segunda capa
  HH(-12.6, -5.4, 21.4, 25.4, 3.5, 10.6);
  HH(-6.4, 2.6, 22.8, 26.4, 4.5, 11.0);
  HH(1.2, 9.0, 21.5, 25.8, 4.0, 10.8);
  HH(7.4, 12.8, 18.8, 24.0, 2.5, 9.8);
  // Coronilla
  HH(-1.6, 7.4, 26.0, 29.4, -1.5, 6.0);
  HH(-9.4, -0.6, 25.4, 28.0, -0.5, 6.5);
  HH(4.0, 11.6, 25.0, 27.6, -4.5, 3.0);
  HH(-11.8, -4.0, 24.6, 27.0, -8.0, 0.5);
  HH(-5.0, 5.0, 25.4, 28.4, -9.0, -1.0);
  HH(2.0, 11.4, 24.6, 27.2, -11.0, -3.5);
  HH(-11.5, -2.5, 24.0, 26.4, -12.6, -6.5);
  HH(6.5, 12.6, 22.0, 26.0, -6.0, 2.0);
  HH(-13.0, -8.0, 21.0, 25.5, -6.0, 3.6);
  HH(-8.5, 0.5, 27.6, 28.9, -6.0, 1.5);
  // Nuca: losas horizontales; las del centro sobresalen más
  for (const [ya, yb, half, zb] of [[7.0, 9.8, 10.4, -12.6], [9.6, 12.6, 11.4, -13.2], [12.4, 15.6, 12.2, -13.8], [15.4, 18.6, 12.6, -14.2], [18.4, 21.6, 12.6, -14.0], [21.4, 24.4, 12.0, -13.4], [24.2, 26.6, 10.8, -12.4]]) {
    let x = -half;
    while (x < half - 0.1) {
      let w = rand(4.5, 8.0);
      if (half - (x + w) < 3) w = half - x;
      const xc = Math.abs(x + w / 2) / half;
      HH(x, x + w, ya + rand(-0.2, 0.15), yb + rand(-0.15, 0.25), zb + xc * xc * 1.2 - rand(0, 0.6), -8.5);
      x += w;
    }
  }
  // Laterales: losas largas apiladas
  for (const s of [1, -1]) {
    for (const [ya, yb, za, zb, out] of [[7.0, 9.8, -12.4, -4.0, 11.7], [9.6, 12.3, -12.8, -4.0, 12.0], [13.0, 16.4, -13.0, 4.8, 12.3], [16.2, 19.6, -13.4, 4.8, 12.8], [19.4, 22.8, -13.2, 3.8, 12.8], [22.6, 25.8, -12.2, 2.2, 12.1]]) {
      let z = za;
      while (z < zb - 0.1) {
        let w = rand(5.5, 9.5);
        if (zb - (z + w) < 3.2) w = zb - z;
        const zc = Math.min(1, Math.abs(z + w / 2 + 4) / 9);
        HH(s * 10.4, s * (out - zc * 0.6 + rand(-0.25, 0.35)), ya + rand(-0.2, 0.15), yb + rand(-0.15, 0.2), z, z + w);
        z += w;
      }
    }
  }

  /* ---------------- TORSO: camiseta blanca con estampado ---------------- */
  const SH = { x0: -12.8, x1: 12.8, y0: 34.6, y1: 61.4, z0: -7.2, z1: 7.2 };
  const shirt: [number, number, number, number, number, number] = [SH.x0, SH.x1, SH.y0, SH.y1, SH.z0, SH.z1];
  box("torso", -12.6, 12.6, 34.8, 61.2, -7.0, 7.0, "#eef2f6", { r: 0.5 });
  // Frente: los ladrillos llevan el estampado proyectado (sigue el relieve)
  const printUV: UVFn = (x, y) => [(x - SH.x0) / (SH.x1 - SH.x0), (y - SH.y0) / (SH.y1 - SH.y0)];
  bricks("torso", shirt, {
    faces: ["pz"], mat: "print", uv: printUV, color: ["#fbfcfd", "#f6f8fa", "#f9fafb"], jit: 0.012,
    rowH: [1.8, 2.8], bw: [3.0, 5.6], r: 0.06,
    prot: (f, u, v) => (Math.abs(u) < 10.0 && v > 36 && v < 59.5 ? rand(0.04, 0.18) : defProt()),
  });
  bricks("torso", shirt, { faces: ["px", "nx", "nz"], color: C.white, rowH: [1.8, 2.8], bw: [3.0, 5.8], r: 0.07 });
  bricks("torso", shirt, {
    faces: ["py"], color: C.white, rowH: [2.4, 3.4], bw: [3.2, 5.6], r: 0.08,
    skip: (f, ua, ub, va, vb) => ub > -5.6 && ua < 5.6 && vb > -5.8 && va < 4.2,
  });
  bricks("torso", [-13.1, 13.1, 33.9, 35.6, -7.5, 7.5], { faces: ["pz", "nz", "px", "nx"], color: ["#eef2f6", "#e8edf3", "#f2f5f8"], rowH: [1.7, 1.7], bw: [3.2, 6.0], r: 0.08, prot: () => rand(0.1, 0.45) });
  // Cuello redondo: cinta interior amarilla
  box("torso", -5.6, 5.6, 60.6, 62.5, -5.8, 4.2, C.yellow, { r: 0.25 });
  box("torso", -5.3, 5.3, 61.0, 62.7, -6.3, -5.0, "#f7bd2f", { r: 0.25 });
  box("torso", -6.8, 6.8, 61.0, 62.5, 3.8, 5.9, "#f6f8fa", { r: 0.4 });
  for (const s of [1, -1]) {
    box("torso", s * 5.4, s * 7.6, 61.0, 63.1, -6.6, 5.6, "#f2f5f8", { r: 0.4 });
    box("torso", s * 5.3, s * 8.2, 61.0, 62.4, -7.3, -5.0, "#eef2f6", { r: 0.35 });
    box("torso", s * 5.6, s * 7.4, 62.8, 63.9, -2.0, 3.4, "#f8f9fb", { r: 0.3 });
  }

  /* ---------------- BRAZOS (a lo largo de +x para L, espejados para R) ---------------- */
  for (const [S, s] of [["L", 1], ["R", -1]] as const) {
    const X = (a0: number, a1: number): [number, number] => (s > 0 ? [a0, a1] : [-a1, -a0]);
    const A = (jn: string, a0: number, a1: number, y0: number, y1: number, z0: number, z1: number, c: string, o?: BoxOpts) => {
      const [x0, x1] = X(a0, a1);
      box(jn + S, x0, x1, y0, y1, z0, z1, c, o);
    };
    const end: Face = s > 0 ? "px" : "nx";
    A("shoulder", 12.6, 20.6, 50.6, 60.6, -5.0, 5.0, "#eef2f6", { r: 0.4 });
    const [sx0, sx1] = X(12.4, 20.8);
    bricks("shoulder" + S, [sx0, sx1, 50.4, 60.8, -5.2, 5.2], { faces: ["py", "ny", "pz", "nz", end], color: C.white, rowH: [1.8, 2.8], bw: [2.8, 5.0], r: 0.07 });
    A("shoulder", 20.0, 25.4, 51.4, 59.8, -4.2, 4.2, C.skin, { seg: 2, r: 0.55, mat: "skin" });
    A("elbow", 24.8, 34.2, 51.6, 59.6, -4.0, 4.0, "#f4c78f", { seg: 2, r: 0.55, mat: "skin" });
    if (s > 0) A("elbow", 32.0, 33.9, 51.25, 59.95, -4.35, 4.35, C.band, { seg: 2, r: 0.3 }); // pulsera negra
    A("hand", 33.8, 39.2, 51.7, 59.5, -3.4, 3.6, "#f5c88f", { seg: 2, r: 0.5, mat: "skin" });
    A("hand", 38.8, 41.6, 57.0, 59.5, -3.0, 3.3, "#f6cb93", { r: 0.32, mat: "skin" });
    A("hand", 38.8, 42.4, 54.4, 57.0, -3.0, 3.3, "#f3c48b", { r: 0.32, mat: "skin" });
    A("hand", 38.8, 41.4, 51.8, 54.4, -3.0, 3.3, "#f0c086", { r: 0.32, mat: "skin" });
    A("hand", 34.6, 38.0, 59.3, 61.4, -0.8, 3.2, "#f6cb93", { r: 0.38, mat: "skin" });
    A("hand", 35.0, 37.6, 61.2, 64.2, -0.4, 2.8, "#f7cf98", { r: 0.38, mat: "skin" });
    A("hand", 36.4, 36.65, 54.0, 57.6, 3.55, 3.75, C.crease, { r: 0.05, mat: "skin" });
  }

  /* ---------------- PANTALÓN (jean) y ZAPATILLAS ---------------- */
  const jeansProt = () => {
    const r = R();
    return r < 0.45 ? rand(0.05, 0.15) : r < 0.85 ? rand(0.18, 0.38) : rand(0.42, 0.65);
  };
  const jeansColor = (f: Face, u: number, v: number, row: number) => {
    const c = new THREE.Color(pick(C.jeans));
    c.offsetHSL(0, 0, row % 2 ? 0.014 : -0.012); // pliegues horizontales
    return "#" + c.getHexString();
  };
  box("hips", -11.2, 11.2, 25.6, 34.2, -6.0, 6.0, "#1a5cc4", { r: 0.5 });
  bricks("hips", [-11.4, 11.4, 25.8, 31.4, -6.2, 6.2], { faces: ["pz", "nz", "px", "nx"], color: jeansColor, prot: jeansProt, rowH: [2.0, 3.0], bw: [3.6, 7.0], r: 0.06 });
  bricks("hips", [-11.7, 11.7, 31.2, 34.4, -6.5, 6.5], { faces: ["pz", "nz", "px", "nx"], color: C.waist, prot: () => rand(0.08, 0.25), rowH: [3.2, 3.2], bw: [3.6, 6.4], r: 0.08 });
  box("hips", -1.3, 1.3, 25.4, 31.6, 6.2, 7.1, "#1650b6", { r: 0.3 });
  box("hips", -0.15, 0.15, 26.0, 31.0, 7.05, 7.2, "#0c3a92", { r: 0.05 });
  for (const x of [-9.6, -4.4, 4.4, 9.6]) box("hips", x - 0.6, x + 0.6, 30.9, 34.7, 6.5, 7.1, "#2268cd", { r: 0.2 });
  for (const x of [-9.6, -3.6, 0, 3.6, 9.6]) box("hips", x - 0.6, x + 0.6, 30.9, 34.7, -7.1, -6.5, "#2268cd", { r: 0.2 });

  for (const [S, s] of [["L", 1], ["R", -1]] as const) {
    const c = s * 6.0;
    box("leg" + S, c - 4.8, c + 4.8, 18.0, 29.4, -5.0, 5.0, "#1a5cc4", { r: 0.5 });
    bricks("leg" + S, [c - 5.0, c + 5.0, 18.0, 29.4, -5.2, 5.2], { faces: ["px", "nx", "pz", "nz"], color: jeansColor, prot: jeansProt, rowH: [2.0, 3.0], bw: [3.4, 6.6], r: 0.06 });
    box("knee" + S, c - 4.3, c + 4.3, 10.4, 18.4, -4.6, 4.6, "#1a5cc4", { r: 0.5 });
    bricks("knee" + S, [c - 4.5, c + 4.5, 10.4, 18.4, -4.8, 4.8], { faces: ["px", "nx", "pz", "nz"], color: jeansColor, prot: jeansProt, rowH: [2.0, 3.0], bw: [3.4, 6.6], r: 0.06 });
    box("knee" + S, c - 4.8, c + 4.8, 7.8, 10.7, -5.0, 5.0, "#1449b0", { r: 0.4 });
    bricks("knee" + S, [c - 5.0, c + 5.0, 7.7, 10.8, -5.2, 5.2], { faces: ["px", "nx", "pz", "nz", "py"], color: C.cuff, prot: () => rand(0.08, 0.35), rowH: [3.1, 3.1], bw: [3.6, 6.0], r: 0.08 });

    // Zapatilla blanca con capas grises y detalles rojos
    const F = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, colr: string, o: BoxOpts = {}) =>
      box("foot" + S, c + x0, c + x1, y0, y1, z0, z1, colr, { seg: 2, r: 0.45, ...o });
    F(-5.0, 5.0, 0, 1.7, -6.2, 3.6, C.shoe, { r: 0.2 });
    F(-5.05, 5.05, 1.6, 3.4, -6.25, 3.6, C.sole, { r: 0.18 });
    F(-4.9, 4.9, 3.3, 5.6, -6.1, 3.6, C.shoe, { r: 0.2 });
    F(-4.6, 4.6, 5.5, 8.4, -5.7, 2.4, "#f2f4f7", { r: 0.22 });
    F(-5.0, 5.0, 0, 1.9, 3.4, 10.6, C.sole, { r: 0.2 });
    F(-4.95, 4.95, 1.8, 4.6, 3.4, 10.4, "#fbfcfd", { r: 0.22 });
    F(-3.0, 3.0, 4.5, 6.3, 1.8, 6.6, C.shoe, { r: 0.2 });
    F(-2.0, 2.0, 6.15, 6.42, 3.5, 4.7, C.laceSlot, { r: 0.08, seg: 1 });
    F(-3.3, 3.3, 6.2, 7.6, 1.4, 3.4, "#fbfcfd", { r: 0.2 });
    for (const side of [1, -1]) {
      F(side * 4.3, side * 5.25, 1.9, 4.9, 2.4, 4.6, C.red, { r: 0.18, seg: 1 });
      F(side * 4.35, side * 4.95, 5.2, 7.6, -2.6, 2.6, C.red, { r: 0.15, seg: 1 });
      F(side * 2.6, side * 4.95, 5.2, 7.6, 2.2, 2.75, C.red, { r: 0.12, seg: 1 });
    }
    F(s * 2.2, s * 4.7, 4.6, 7.0, -6.5, -5.75, C.red, { r: 0.15, seg: 1 });
  }

  return { J, parts, geoCache };
}

/* ------------------------------------------------------------------ *
 *  Estampado de la camiseta (canvas → textura)
 * ------------------------------------------------------------------ */
async function makePrint(fonts: { slab: string; sans: string }) {
  const slab = `${fonts.slab}, Rockwell, Georgia, serif`;
  const sans = `${fonts.sans}, Arial, sans-serif`;
  try {
    await Promise.race([
      Promise.all([document.fonts.load(`900 200px ${slab}`), document.fonts.load(`700 100px ${sans}`)]),
      new Promise((r) => setTimeout(r, 2500)),
    ]);
  } catch {
    /* si la fuente no carga se usa la alternativa */
  }
  const S = 1024, cv = document.createElement("canvas");
  cv.width = cv.height = S;
  const ctx = cv.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, S, S);
  ctx.textBaseline = "alphabetic";
  // PAUL con serifa y degradado arcoíris
  const L = ["P", "A", "U", "L"];
  let fs = 300;
  ctx.font = `900 ${fs}px ${slab}`;
  let ws = L.map((l) => ctx.measureText(l).width), tot = ws.reduce((a, b) => a + b) - 0.06 * fs;
  fs *= (0.73 * S) / tot;
  ctx.font = `900 ${fs}px ${slab}`;
  ws = L.map((l) => ctx.measureText(l).width);
  tot = ws.reduce((a, b) => a + b) - 0.06 * fs;
  let x = 0.465 * S - tot / 2;
  const base = 0.315 * S, top = base - fs * 0.72;
  const grads: ([string, string] | null)[] = [["#f8873a", "#ea5a2b"], ["#f9c232", "#f29a1e"], null, ["#a94cc6", "#7a37ae"]];
  L.forEach((l, i) => {
    let g: CanvasGradient;
    const gr = grads[i];
    if (!gr) {
      g = ctx.createLinearGradient(x, 0, x + ws[i], 0);
      g.addColorStop(0, "#dccd2c");
      g.addColorStop(0.45, "#7cc03d");
      g.addColorStop(1, "#2faa52");
    } else {
      g = ctx.createLinearGradient(0, top, 0, base);
      g.addColorStop(0, gr[0]);
      g.addColorStop(1, gr[1]);
    }
    ctx.fillStyle = g;
    ctx.fillText(l, x, base);
    x += ws[i] - 0.02 * fs;
  });
  // ZARUMA espaciado en azul marino
  const word = "ZARUMA";
  let zf = 110;
  ctx.font = `700 ${zf}px ${sans}`;
  const sp = () => zf * 0.34;
  const zw = () => [...word].reduce((a, ch) => a + ctx.measureText(ch).width, 0) + sp() * (word.length - 1);
  zf *= (0.6 * S) / zw();
  ctx.font = `700 ${zf}px ${sans}`;
  let zx = 0.465 * S - zw() / 2;
  ctx.fillStyle = "#22407c";
  for (const ch of word) {
    ctx.fillText(ch, zx, 0.478 * S);
    zx += ctx.measureText(ch).width + sp();
  }
  // Portátil con </> y engranaje
  const lw = 0.024 * S;
  ctx.strokeStyle = "#121212";
  ctx.fillStyle = "#121212";
  ctx.lineWidth = lw;
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.roundRect(0.215 * S, 0.515 * S, 0.4 * S, 0.262 * S, 0.016 * S);
  ctx.stroke();
  ctx.font = `700 ${0.115 * S}px ${sans}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("</>", 0.415 * S, 0.652 * S);
  ctx.textAlign = "start";
  ctx.beginPath();
  ctx.moveTo(0.19 * S, 0.792 * S);
  ctx.lineTo(0.628 * S, 0.792 * S);
  ctx.lineTo(0.645 * S, 0.858 * S);
  ctx.lineTo(0.13 * S, 0.858 * S);
  ctx.closePath();
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#121212";
  ctx.fillRect(0.13 * S, 0.846 * S, 0.515 * S, 0.02 * S);
  ctx.save();
  ctx.translate(0.712 * S, 0.835 * S);
  ctx.beginPath();
  ctx.arc(0, 0, 0.074 * S, 0, Math.PI * 2);
  ctx.fill();
  for (let i = 0; i < 8; i++) {
    ctx.save();
    ctx.rotate((i * Math.PI) / 4);
    ctx.fillRect(-0.022 * S, -0.1 * S, 0.044 * S, 0.05 * S);
    ctx.restore();
  }
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(0, 0, 0.03 * S, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  return cv;
}

function makeLensTexture() {
  const cv = document.createElement("canvas"), soft = document.createElement("canvas");
  cv.width = soft.width = 160;
  cv.height = soft.height = 128;
  const g = cv.getContext("2d")!;
  lensRows.forEach((row, ri) => row.forEach((c, ci) => {
    g.fillStyle = c;
    g.fillRect(ci * 32, ri * 32, 32, 32);
  }));
  const sg = soft.getContext("2d")!;
  sg.filter = "blur(2.5px)";
  sg.drawImage(cv, -8, -8, 176, 144);
  sg.filter = "none";
  sg.globalAlpha = 0.55;
  sg.drawImage(cv, 0, 0);
  const tex = new THREE.CanvasTexture(soft);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* ------------------------------------------------------------------ *
 *  Animación: poses (en grados) y acciones con fundido entre ellas
 * ------------------------------------------------------------------ */
const KEYS = ["rootY", "hipsY", "hipsRx", "hipsRy", "hipsRz", "torsoRx", "torsoRy", "torsoRz", "breath", "headRx", "headRy", "headRz",
  ...["L", "R"].flatMap((S) => ["shRz", "shFw", "shTw", "elFlex", "elUp", "elTw", "hdBend", "hdFlex", "hdTw", "legRx", "legRz", "kneeRx", "footRx"].map((k) => k + S))];

function relaxed(t: number): Pose {
  const b = Math.sin(t * 1.9);
  return {
    breath: b,
    torsoRz: Math.sin(t * 0.8) * 0.8, torsoRx: 0.5,
    headRz: 2 + Math.sin(t * 0.7) * 1.5, headRy: -5 + Math.sin(t * 0.45) * 6, headRx: -1 + b * 0.6,
    shRzR: -84 + b * 0.8, shFwR: 4, shTwR: 88, elFlexR: 10, hdBendR: 0,
    shRzL: -60 + b * 0.8, shFwL: -4, shTwL: 90, elFlexL: 56, hdFlexL: 12, hdBendL: 0,
    legRzL: 1.5, legRzR: 1.5,
  };
}
function mixPose(a: Pose, b: Pose, w: number): Pose {
  const o: Pose = {};
  for (const k of KEYS) o[k] = lerp(a[k] || 0, b[k] || 0, w);
  return o;
}
// Dobla las rodillas manteniendo los pies en el suelo
function crouch(p: Pose, a: number): Pose {
  for (const S of ["L", "R"]) {
    p["legRx" + S] = (p["legRx" + S] || 0) - a;
    p["kneeRx" + S] = (p["kneeRx" + S] || 0) + 2 * a;
    p["footRx" + S] = (p["footRx" + S] || 0) - a;
  }
  p.hipsY = (p.hipsY || 0) - 22 * (1 - Math.cos(D(a)));
  return p;
}
const ACTIONS: Record<PaulAction, { dur: number; pose: (t: number) => Pose }> = {
  idle: { dur: 3.6, pose: relaxed },
  wave: {
    dur: 3.4,
    pose: (t) => {
      const p = relaxed(t);
      const w = Math.sin(t * 9.5);
      return Object.assign(p, { shRzR: 16, shFwR: 14, shTwR: 0, elFlexR: 0, elUpR: 100 + w * 16, hdBendR: w * 10, headRz: -5, headRy: -10, torsoRz: -2.5, headRx: -2 });
    },
  },
  // Despedida al hacer scroll: cabeza gacha y un adiós más lento y amplio
  bye: {
    dur: 2.8,
    pose: (t) => {
      const p = relaxed(t);
      const w = Math.sin(t * 7);
      return Object.assign(p, { shRzR: 8, shFwR: 18, shTwR: 0, elFlexR: 0, elUpR: 104 + w * 22, hdBendR: w * 14, headRz: -7, headRy: -8, headRx: 10, torsoRz: -2, torsoRx: 3 });
    },
  },
  tpose: {
    dur: 3.0,
    pose: (t) => {
      const p: Pose = { breath: Math.sin(t * 2), headRx: -3, headRz: Math.sin(t * 1.5) * 2, shRzL: 3, shRzR: 3, shFwL: 6, shFwR: 6, elFlexL: 4, elFlexR: 4, legRzL: 3, legRzR: 3 };
      return crouch(p, t < 0.7 ? 10 * Math.sin((t / 0.7) * Math.PI) : 0);
    },
  },
  thumbs: {
    dur: 3.0,
    pose: (t) => {
      const pump = Math.sin(t * 6) * 4;
      return { breath: Math.sin(t * 2), headRx: -4, headRy: 4, headRz: -3, torsoRx: -2, shRzL: -4 + pump, shRzR: -4 + pump, shFwL: 42, shFwR: 42, shTwL: 0, shTwR: 0, elFlexL: 14, elFlexR: 14, legRzL: 2, legRzR: 2 };
    },
  },
  dance: {
    dur: 5.0,
    pose: (t) => {
      const ph = t * 2.3 * Math.PI * 2, s = Math.sin(ph), c = Math.cos(ph), s2 = Math.sin(ph / 2);
      const p: Pose = {
        rootY: Math.abs(Math.sin(ph)) * 1.6, hipsRz: s2 * 5, hipsRy: s2 * 8, torsoRy: -s2 * 12, torsoRz: -s2 * 3,
        headRx: -4 + Math.abs(s) * 7, headRz: s2 * 6, headRy: s2 * 10,
        shRzL: -30 + s * 32, shRzR: -30 - s * 32, shFwL: 30, shFwR: 30, shTwL: 90, shTwR: 90, elFlexL: 95 + c * 20, elFlexR: 95 - c * 20,
        legRzL: 3, legRzR: 3, breath: s,
      };
      crouch(p, 8 + Math.abs(s) * 8);
      p.kneeRxL += Math.max(0, s) * 18; p.legRxL -= Math.max(0, s) * 9; p.footRxL -= Math.max(0, s) * 9;
      p.kneeRxR += Math.max(0, -s) * 18; p.legRxR -= Math.max(0, -s) * 9; p.footRxR -= Math.max(0, -s) * 9;
      return p;
    },
  },
  jump: {
    dur: 2.2,
    pose: (t) => {
      const base = relaxed(t);
      const both = (o: Pose) => {
        const r: Pose = { ...base };
        for (const [k, v] of Object.entries(o)) { r[k + "L"] = v; r[k + "R"] = v; }
        return r;
      };
      const prep = { ...both({ shRz: -72, shFw: -35, shTw: 90, elFlex: 12 }), torsoRx: 12, headRx: -6 };
      const air = { ...both({ shRz: 58, shFw: 12, shTw: 0, elFlex: 6, elUp: 12 }), torsoRx: -3, headRx: -8 };
      const land = { ...both({ shRz: -50, shFw: 28, shTw: 90, elFlex: 35 }), torsoRx: 10, headRx: 2 };
      let p: Pose;
      if (t < 0.38) p = mixPose(base, prep, smooth(t / 0.38));
      else if (t < 0.6) p = mixPose(prep, air, smooth((t - 0.38) / 0.22));
      else if (t < 0.8) p = { ...air };
      else if (t < 1.1) p = mixPose(air, land, smooth((t - 0.8) / 0.3));
      else if (t < 1.5) p = { ...land };
      else p = mixPose(land, base, smooth((t - 1.5) / 0.6));
      let cr = 0;
      if (t < 0.38) cr = 30 * smooth(t / 0.38);
      else if (t < 0.6) cr = 30 * (1 - smooth((t - 0.38) / 0.22));
      if (t > 0.6 && t < 1.0) cr = 7 * Math.sin(((t - 0.6) / 0.4) * Math.PI);
      if (t >= 1.08 && t < 1.7) cr = 26 * Math.sin(((t - 1.08) / 0.62) * Math.PI);
      if (t >= 0.45 && t <= 1.08) p.rootY = Math.sin(((t - 0.45) / 0.63) * Math.PI) * 13;
      return crouch(p, cr);
    },
  },
};
const SEQUENCE: PaulAction[] = ["idle", "wave", "idle", "tpose", "idle", "thumbs", "idle", "dance", "idle", "jump"];

// Mirada (grados): cuánto gira hacia el puntero y cuánto agacha la cabeza al hacer scroll
const LOOK_YAW = 40, LOOK_UP = 20, LOOK_DOWN = 24, SCROLL_TILT = 26;
// Scroll (px): se despide al pasar BYE_AT bajando y saluda al volver por debajo de HELLO_AT
const BYE_AT = 60, HELLO_AT = 30, TILT_RANGE = 260;
// Segundos que dura el globo de diálogo y su ancho mínimo en px (igual al 7.5rem del componente)
const SAY_TIME = 3.2, SAY_MIN_W = 120;

/* ------------------------------------------------------------------ *
 *  Escena
 * ------------------------------------------------------------------ */
export function createPaulScene({ host, interaction, fonts, onReady, onSay }: PaulSceneOptions): PaulScene {
  let disposed = false;
  const cleanups: (() => void)[] = [];
  const on = (target: EventTarget, type: string, fn: EventListener, opts?: AddEventListenerOptions) => {
    target.addEventListener(type, fn, opts);
    cleanups.push(() => target.removeEventListener(type, fn, opts));
  };

  const fine = matchMedia("(pointer: fine)").matches;
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const size = () => ({ w: Math.max(1, host.clientWidth), h: Math.max(1, host.clientHeight) });

  // Renderer con fondo transparente para integrarse con la página
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const { w: w0, h: h0 } = size();
  renderer.setSize(w0, h0);
  renderer.domElement.style.display = "block";
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTex;
  scene.environmentIntensity = 0.45;
  scene.add(new THREE.HemisphereLight("#f2f6ff", "#d9aaa6", 0.7));
  const key = new THREE.DirectionalLight("#fff2e4", 2.7);
  key.position.set(-70, 150, 120);
  key.target.position.set(0, 45, 0);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -70, right: 70, top: 75, bottom: -60, near: 10, far: 450 });
  key.shadow.camera.updateProjectionMatrix();
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.12;
  const fill = new THREE.DirectionalLight("#dfe8ff", 0.7);
  fill.position.set(120, 60, 60);
  const rim = new THREE.DirectionalLight("#ffffff", 0.9);
  rim.position.set(30, 120, -160);
  scene.add(key, key.target, fill, rim);

  // Sombra de contacto suave bajo los pies (en su propia escena: queda detrás)
  const blobCv = document.createElement("canvas");
  blobCv.width = blobCv.height = 128;
  {
    const g = blobCv.getContext("2d")!, rg = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    rg.addColorStop(0, "rgba(15,23,42,0.32)");
    rg.addColorStop(0.55, "rgba(15,23,42,0.12)");
    rg.addColorStop(1, "rgba(15,23,42,0)");
    g.fillStyle = rg;
    g.fillRect(0, 0, 128, 128);
  }
  const blobTex = new THREE.CanvasTexture(blobCv);
  const blob = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false, toneMapped: false }));
  blob.rotation.x = -Math.PI / 2;
  blob.position.y = 0.05;
  blob.scale.set(46, 30, 1);
  const blobScene = new THREE.Scene();
  blobScene.add(blob);

  // Materiales
  const lensTex = makeLensTexture();
  const mats: Record<MatKey, THREE.MeshStandardMaterial> = {
    std: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.8 }),
    skin: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.62, color: "#f7e2cf" }),
    hair: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.55 }),
    frame: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.35 }),
    lens: new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.08, emissive: "#ffffff", emissiveIntensity: 0.32, map: lensTex, emissiveMap: lensTex }),
    print: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.8 }),
  };

  // Modelo
  const { J, parts, geoCache } = buildCharacter();
  scene.add(J.root);
  const hipsRestY = J.hips.position.y;

  // Cámara: encaja al personaje (incluida la pose T) en el contenedor
  const camera = new THREE.PerspectiveCamera(28, w0 / h0, 5, 3000);
  // Vertical: del suelo (-2) hasta 112, para que el pelo no se corte al saltar.
  const target = new THREE.Vector3(0, 55, 0);
  const HOME_AZ = D(18), HOME_EL = D(5);
  const fitDistance = () => {
    const t = Math.tan(D(camera.fov / 2));
    return Math.max(57 / t, 46 / (t * camera.aspect));
  };
  const placeCamera = (az: number, el: number, d = fitDistance()) =>
    camera.position.set(Math.sin(az) * Math.cos(el) * d, target.y + Math.sin(el) * d, Math.cos(az) * Math.cos(el) * d);
  placeCamera(HOME_AZ, HOME_EL);
  camera.lookAt(target);

  // Oclusión ambiental solo en equipos con ratón (en móviles prima la fluidez)
  let composer: EffectComposer | null = null;
  if (fine) {
    const rt = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 4 });
    composer = new EffectComposer(renderer, rt);
    composer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    composer.setSize(w0, h0);
    composer.addPass(new RenderPass(blobScene, camera));
    const main = new RenderPass(scene, camera);
    main.clear = false;
    composer.addPass(main);
    const gtao = new GTAOPass(scene, camera, w0, h0);
    gtao.blendIntensity = 0.9;
    gtao.updateGtaoMaterial({ radius: 3.2, distanceExponent: 1.4, thickness: 2.0, scale: 1.15, samples: 16, distanceFallOff: 1.0 });
    gtao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 5, rings: 2, samples: 16 });
    composer.addPass(gtao);
    composer.addPass(new OutputPass());
  }

  // Girar arrastrando (solo horizontal-ish, sin zoom para no bloquear el scroll)
  let controls: OrbitControls | null = null;
  let returnTimer = 0;
  let camTween: { from: number; to: number; t: number } | null = null;
  if (fine) {
    controls = new OrbitControls(camera, interaction);
    controls.target.copy(target);
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.rotateSpeed = 0.7;
    controls.minPolarAngle = D(72);
    controls.maxPolarAngle = D(95);
    controls.addEventListener("start", () => {
      window.clearTimeout(returnTimer);
      camTween = null;
    });
    // Tras soltar, vuelve suavemente a la vista inicial
    controls.addEventListener("end", () => {
      window.clearTimeout(returnTimer);
      returnTimer = window.setTimeout(() => {
        camTween = { from: controls!.getAzimuthalAngle(), to: HOME_AZ, t: 0 };
      }, 2500);
    });
    controls.update();
    interaction.style.cursor = "grab";
    cleanups.push(() => {
      interaction.style.cursor = "";
      window.clearTimeout(returnTimer);
    });
  }

  // Clic / toque sin arrastrar → saluda (con el dedo se tolera un poco más de movimiento)
  let down: { x: number; y: number; t: number; slop: number } | null = null;
  on(interaction, "pointerdown", ((e: PointerEvent) => {
    down = { x: e.clientX, y: e.clientY, t: performance.now(), slop: e.pointerType === "mouse" ? 6 : 12 };
  }) as EventListener);
  on(interaction, "pointerup", ((e: PointerEvent) => {
    if (!down) return;
    const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
    if (moved < down.slop && performance.now() - down.t < 700) greet("click");
    down = null;
  }) as EventListener);
  on(interaction, "pointercancel", () => { down = null; });

  // Habla: globo de diálogo junto a la boca durante SAY_TIME segundos
  const talk = { t: 0 };
  const SAY_ANCHOR = new THREE.Vector3(14.5, 8.3, 7.6); // junto a la quijada (lado derecho en pantalla), en coordenadas de la cabeza
  const sayAt = new THREE.Vector3();
  const placeBubble = () => {
    const hr = host.getBoundingClientRect(), ir = interaction.getBoundingClientRect();
    sayAt.copy(SAY_ANCHOR);
    J.head.localToWorld(sayAt).project(camera);
    const x = hr.left + ((sayAt.x + 1) / 2) * hr.width, y = hr.top + ((1 - sayAt.y) / 2) * hr.height;
    // Ancho libre a la derecha; si no alcanza para SAY_MIN_W, el globo se corre a la izquierda
    const room = Math.round(document.documentElement.clientWidth - x - 10);
    interaction.style.setProperty("--say-x", `${(x - ir.left).toFixed(1)}px`);
    interaction.style.setProperty("--say-y", `${(y - ir.top).toFixed(1)}px`);
    interaction.style.setProperty("--say-room", `${room}px`);
    interaction.style.setProperty("--say-shift", `${THREE.MathUtils.clamp(SAY_MIN_W - room, 0, 80)}px`);
  };
  cleanups.push(() => ["--say-x", "--say-y", "--say-room", "--say-shift"].forEach((p) => interaction.style.removeProperty(p)));
  const say = (kind: PaulSay) => {
    if (!onSay) return;
    placeBubble();
    talk.t = SAY_TIME;
    onSay(kind);
  };

  // Al saludar (clic o volver arriba) deja de seguir el puntero y mira de frente a la pantalla
  const front = { t: 0, v: 0 };
  const greet = (kind: PaulSay) => {
    api.play("wave");
    front.t = ACTIONS.wave.dur;
    say(kind);
  };

  // La cabeza (y un poco el torso) sigue al puntero; los ángulos se recalculan
  // en cada cuadro para que la mirada siga fija aunque la página se desplace.
  const pointer = { x: 0, y: 0, active: false };
  const look = { x: 0, y: 0, tx: 0, ty: 0 };
  const EYES = new THREE.Vector3(0, 42, 11.5); // entre las gafas, en coordenadas del torso
  const eyes = new THREE.Vector3();
  if (fine) {
    on(window, "pointermove", ((e: PointerEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = true;
    }) as EventListener, { passive: true });
    on(document.documentElement, "mouseleave", () => { pointer.active = false; });
  }
  const aimAtPointer = (az: number) => {
    if (!pointer.active) {
      look.tx = look.ty = 0;
      return;
    }
    const r = host.getBoundingClientRect();
    eyes.copy(EYES);
    J.torso.localToWorld(eyes).project(camera);
    const dx = pointer.x - (r.left + ((eyes.x + 1) / 2) * r.width);
    const dy = pointer.y - (r.top + ((1 - eyes.y) / 2) * r.height);
    // Como si el puntero estuviera a media altura del contenedor delante de él:
    // cerca de la cara reacciona rápido y lejos se satura en el giro máximo.
    const depth = r.height * 0.5;
    look.tx = THREE.MathUtils.clamp(THREE.MathUtils.radToDeg(az + Math.atan2(dx, depth)), -LOOK_YAW, LOOK_YAW);
    look.ty = THREE.MathUtils.clamp(THREE.MathUtils.radToDeg(Math.atan2(dy, depth)), -LOOK_UP, LOOK_DOWN);
  };

  // Al bajar con el scroll agacha la cabeza y se despide; al volver arriba saluda
  const scroll = { v: 0, t: 0, away: false };
  const readScroll = () => {
    const y = window.scrollY;
    scroll.t = reduceMotion ? 0 : clamp01(y / TILT_RANGE);
    if (!scroll.away && y > BYE_AT) {
      scroll.away = true;
      if (ready && !reduceMotion) {
        api.play("bye");
        front.t = 0;
        say("bye");
      }
    } else if (scroll.away && y < HELLO_AT) {
      scroll.away = false;
      if (ready && !reduceMotion) greet("hello");
    }
  };
  // Si la página carga ya desplazada, arranca mirando abajo pero sin despedirse
  scroll.away = window.scrollY > BYE_AT;
  scroll.t = scroll.v = reduceMotion ? 0 : clamp01(window.scrollY / TILT_RANGE);
  on(window, "scroll", readScroll, { passive: true });

  // Animación
  const anim = { name: "idle" as PaulAction, t: 0, seq: 0, from: null as Pose | null, blend: 1, last: relaxed(0) };
  const setAction = (name: PaulAction, fromSequence: boolean) => {
    anim.from = { ...anim.last };
    anim.blend = 0;
    anim.name = name;
    anim.t = 0;
    // La despedida no está en la secuencia: después sigue como tras un saludo
    if (!fromSequence) anim.seq = Math.max(0, SEQUENCE.indexOf(name === "bye" ? "wave" : name));
  };

  const applyPose = (p: Pose) => {
    const g = (k: string) => p[k] || 0;
    J.root.position.y = g("rootY");
    J.hips.position.y = hipsRestY + g("hipsY");
    J.hips.rotation.set(D(g("hipsRx")), D(g("hipsRy")), D(g("hipsRz")));
    J.torso.rotation.set(D(g("torsoRx")), D(g("torsoRy")), D(g("torsoRz")));
    J.torso.scale.set(1 - g("breath") * 0.004, 1 + g("breath") * 0.008, 1 + g("breath") * 0.006);
    J.head.rotation.set(D(g("headRx")), D(g("headRy")), D(g("headRz")));
    for (const [S, s] of [["L", 1], ["R", -1]] as const) {
      J["shoulder" + S].rotation.set(D(g("shTw" + S)), -s * D(g("shFw" + S)), s * D(g("shRz" + S)), "ZYX");
      J["elbow" + S].rotation.set(D(g("elTw" + S)), -s * D(g("elFlex" + S)), s * D(g("elUp" + S)), "ZYX");
      J["hand" + S].rotation.set(D(g("hdTw" + S)), -s * D(g("hdFlex" + S)), s * D(g("hdBend" + S)), "ZYX");
      J["leg" + S].rotation.set(D(g("legRx" + S)), 0, s * D(g("legRz" + S)));
      J["knee" + S].rotation.x = D(g("kneeRx" + S));
      J["foot" + S].rotation.x = D(g("footRx" + S));
    }
    const air = Math.max(0, J.root.position.y);
    blob.scale.set(46 * (1 - air / 45), 30 * (1 - air / 45), 1);
    blob.material.opacity = 1 - air / 28;
  };

  const step = (dt: number) => {
    anim.t += dt;
    if (anim.t >= ACTIONS[anim.name].dur && !(reduceMotion && anim.name === "idle")) {
      if (reduceMotion) setAction("idle", true);
      else {
        anim.seq = (anim.seq + 1) % SEQUENCE.length;
        setAction(SEQUENCE[anim.seq], true);
      }
    }
    const tgt = ACTIONS[anim.name].pose(anim.t);
    anim.blend = Math.min(1, anim.blend + dt / 0.45);
    const w = smooth(anim.blend), out: Pose = {};
    for (const k of KEYS) out[k] = anim.from ? lerp(anim.from[k] || 0, tgt[k] || 0, w) : tgt[k] || 0;
    anim.last = out;
    const az = Math.atan2(camera.position.x, camera.position.z);
    const facing = Math.max(0, Math.cos(az));
    front.t = Math.max(0, front.t - dt);
    front.v += ((front.t > 0 ? 1 : 0) - front.v) * Math.min(1, dt * 6);
    if (front.t > 0) {
      look.tx = THREE.MathUtils.clamp(THREE.MathUtils.radToDeg(az), -LOOK_YAW, LOOK_YAW);
      look.ty = 0;
    } else aimAtPointer(az);
    look.x += (look.tx - look.x) * Math.min(1, dt * 6);
    look.y += (look.ty - look.y) * Math.min(1, dt * 6);
    scroll.v += (scroll.t - scroll.v) * Math.min(1, dt * 5);
    // El torso acompaña parte del giro; con el scroll la mirada baja y deja de seguir el puntero
    // en vertical. Al mirar de frente se anulan el giro propio de la pose y la cabeza gacha.
    const yaw = look.x * facing;
    const pitch = lerp(look.y * facing, SCROLL_TILT, scroll.v * (1 - front.v));
    applyPose({
      ...out,
      torsoRy: out.torsoRy + yaw * 0.22,
      torsoRx: out.torsoRx + pitch * 0.12,
      headRy: out.headRy * (1 - front.v) + yaw * 0.78,
      headRx: THREE.MathUtils.clamp(out.headRx + pitch * 0.88, -24, 34),
    });
    if (talk.t > 0) {
      talk.t -= dt;
      placeBubble();
      if (talk.t <= 0) onSay?.(null);
    }
  };

  // Bucle de render (se pausa fuera de pantalla o con la pestaña oculta)
  const clock = new THREE.Clock();
  let ready = false, onScreen = true;
  const frame = () => {
    const dt = Math.min(clock.getDelta(), 0.05);
    step(dt);
    if (camTween && controls) {
      camTween.t = Math.min(1, camTween.t + dt / 0.9);
      const az = lerp(camTween.from, camTween.to, smooth(camTween.t));
      const off = camera.position.clone().sub(controls.target);
      const sph = new THREE.Spherical().setFromVector3(off);
      sph.theta = az;
      sph.phi = lerp(sph.phi, Math.PI / 2 - HOME_EL, smooth(camTween.t));
      camera.position.copy(controls.target).add(off.setFromSpherical(sph));
      if (camTween.t >= 1) camTween = null;
    }
    if (controls) controls.update();
    else camera.lookAt(target);
    if (composer) composer.render();
    else {
      renderer.autoClear = false;
      renderer.clear();
      renderer.render(blobScene, camera);
      renderer.render(scene, camera);
    }
  };
  const updateLoop = () => {
    const run = ready && onScreen && !document.hidden && !disposed;
    if (run) clock.getDelta(); // evita un salto de tiempo al reanudar
    renderer.setAnimationLoop(run ? frame : null);
  };
  const io = new IntersectionObserver(([entry]) => {
    onScreen = entry.isIntersecting;
    updateLoop();
  });
  io.observe(host);
  on(document, "visibilitychange", updateLoop);

  // Redimensionado del contenedor
  const ro = new ResizeObserver(() => {
    const { w, h } = size();
    const before = fitDistance();
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    composer?.setSize(w, h);
    const off = camera.position.clone().sub(target);
    camera.position.copy(target).add(off.multiplyScalar(fitDistance() / before));
  });
  ro.observe(host);

  // El estampado depende de las fuentes: al tenerlo, se fusiona la geometría y arranca
  makePrint(fonts).then((cv) => {
    if (disposed) return;
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    mats.print.map = tex;
    for (const [jn, byMat] of parts) {
      for (const [m, geos] of byMat) {
        const mesh = new THREE.Mesh(mergeGeometries(geos, false), mats[m]);
        mesh.castShadow = mesh.receiveShadow = true;
        J[jn].add(mesh);
        geos.forEach((g) => g.dispose());
      }
    }
    parts.clear();
    geoCache.forEach((g) => g.dispose());
    applyPose(relaxed(0));
    ready = true;
    updateLoop();
    onReady?.();
  });

  const api: PaulScene = {
    play(name) {
      if (!disposed) setAction(name, false);
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      renderer.setAnimationLoop(null);
      io.disconnect();
      ro.disconnect();
      cleanups.forEach((fn) => fn());
      controls?.dispose();
      if (composer) {
        composer.passes.forEach((p) => p.dispose());
        composer.dispose();
      }
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh) o.geometry.dispose();
      });
      blob.geometry.dispose();
      blob.material.dispose();
      blobTex.dispose();
      Object.values(mats).forEach((m) => {
        m.map?.dispose();
        m.dispose();
      });
      envTex.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    },
  };
  return api;
}
