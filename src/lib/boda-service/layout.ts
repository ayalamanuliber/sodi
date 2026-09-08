import type { FloorFeature, FloorPlan, Table, TableGeometry } from './types.ts';

export const CHAIR_MARGIN = 0.5;
export const DEFAULT_FLOOR_PLAN: FloorPlan = { width: 18, height: 12, features: [] };
export type SpatialObject = { x: number; y: number; width: number; height: number; rotation: number; shape?: 'round'|'rectangular' };
export function footprint(object: SpatialObject, margin = 0) {
  const angle = object.rotation * Math.PI / 180;
  const halfWidth = object.width / 2 + margin;
  const halfHeight = object.height / 2 + margin;
  const x = object.shape === 'round' ? halfWidth : Math.abs(Math.cos(angle)) * halfWidth + Math.abs(Math.sin(angle)) * halfHeight;
  const y = object.shape === 'round' ? halfHeight : Math.abs(Math.sin(angle)) * halfWidth + Math.abs(Math.cos(angle)) * halfHeight;
  return { left: object.x - x, right: object.x + x, top: object.y - y, bottom: object.y + y, halfWidth: x, halfHeight: y };
}
export function withinRoom(object: SpatialObject, room: Pick<FloorPlan,'width'|'height'>, margin = 0) {
  const bounds = footprint(object, margin);
  return bounds.left >= -0.000001 && bounds.top >= -0.000001 && bounds.right <= room.width + 0.000001 && bounds.bottom <= room.height + 0.000001;
}
export function clampPosition(object: SpatialObject, room: Pick<FloorPlan,'width'|'height'>, margin = 0) {
  const bounds = footprint(object, margin);
  const round = (v:number) => Math.round(v*100)/100;
  const minX=Math.ceil((bounds.halfWidth-0.00000001)*100)/100,maxX=Math.floor((room.width-bounds.halfWidth+0.00000001)*100)/100;
  const minY=Math.ceil((bounds.halfHeight-0.00000001)*100)/100,maxY=Math.floor((room.height-bounds.halfHeight+0.00000001)*100)/100;
  return { x: round(Math.min(Math.max(object.x,minX),maxX)), y: round(Math.min(Math.max(object.y,minY),maxY)) };
}
export function defaultTableGeometry(index: number, room: Pick<FloorPlan,'width'|'height'>): TableGeometry {
  const columns = Math.max(1, Math.floor((room.width-0.4)/3));
  const rows = Math.max(1, Math.floor((room.height-0.4)/3));
  return { shape: 'round', width: 1.8, height: 1.8, rotation: 0, x: Math.min(room.width-1.4, 1.7+(index%columns)*3), y: Math.min(room.height-1.4,1.7+(Math.floor(index/columns)%rows)*3) };
}
export function ensureLayout<T extends { tables: Table[]; floorPlan?: FloorPlan; review?:'draft'|'needs_review'|'ready' }>(state:T): T & {floorPlan:FloorPlan} {
  const synthesized=state.floorPlan===undefined||state.tables.some(table=>table.shape===undefined);
  if(synthesized&&state.review==='ready')state.review='needs_review';
  const floorPlan = state.floorPlan ?? structuredClone(DEFAULT_FLOOR_PLAN);
  state.floorPlan = floorPlan;
  state.tables = state.tables.map((table,index)=>table.shape===undefined ? {...defaultTableGeometry(index,floorPlan),...table} : table);
  return state as T & {floorPlan:FloorPlan};
}
export function geometryOf(table:Table):TableGeometry { const {shape,x,y,width,height,rotation}=table;return {shape,x,y,width,height,rotation}; }
export function defaultFeature(kind:FloorFeature['kind'], room:FloorPlan):Omit<FloorFeature,'id'> {
  return kind==='entrance'?{kind,label:'Entrada',x:room.width/2,y:0.5,width:1.8,height:0.6,rotation:0}:{kind,label:'Pista',x:room.width/2,y:room.height/2,width:3.2,height:3.2,rotation:0};
}
function polygon(object:SpatialObject,margin:number) {
  const angle=object.rotation*Math.PI/180;
  const points=object.shape==='round'?Array.from({length:24},(_,i)=>({x:Math.cos(i*Math.PI/12)*(object.width/2+margin),y:Math.sin(i*Math.PI/12)*(object.height/2+margin)})):[{x:-object.width/2-margin,y:-object.height/2-margin},{x:object.width/2+margin,y:-object.height/2-margin},{x:object.width/2+margin,y:object.height/2+margin},{x:-object.width/2-margin,y:object.height/2+margin}];
  return points.map(p=>({x:object.x+p.x*Math.cos(angle)-p.y*Math.sin(angle),y:object.y+p.x*Math.sin(angle)+p.y*Math.cos(angle)}));
}
export function overlapping(a:SpatialObject,b:SpatialObject,marginA=0,marginB=0) {
  const first=polygon(a,marginA),second=polygon(b,marginB);
  for(const points of [first,second])for(let i=0;i<points.length;i++) {
    const next=points[(i+1)%points.length],axis={x:-(next.y-points[i].y),y:next.x-points[i].x};
    const project=(vertices:typeof first)=>vertices.map(p=>p.x*axis.x+p.y*axis.y);
    const p=project(first),q=project(second);
    if(Math.max(...p)<=Math.min(...q)+0.000001||Math.max(...q)<=Math.min(...p)+0.000001)return false;
  }
  return true;
}
