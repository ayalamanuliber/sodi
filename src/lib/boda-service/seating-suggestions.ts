import type {EventView, Person} from './types.ts';

export function placeBreakdown(people:Person[]) {
  const places=people.filter(person=>person.seatRequired);
  const wheelchairs=places.filter(person=>person.accessibilityNeeds?.includes('wheelchair_space')).length;
  const highchairs=places.filter(person=>person.accessibilityNeeds?.includes('highchair')).length;
  return {places:places.length,ordinaryChairs:places.length-wheelchairs-highchairs,wheelchairs,highchairs,withoutPlace:people.length-places.length};
}

export function seatingSuggestions(event:EventView) {
  const assigned=new Map(event.assignments.map(row=>[row.personId,row.tableId]));
  const used=new Map(event.tables.map(table=>[table.id,event.assignments.filter(row=>row.tableId===table.id&&event.people.find(person=>person.id===row.personId)?.seatRequired).length]));
  return event.groups.flatMap(group=>{
    const people=event.people.filter(person=>person.groupId===group.id&&person.attendance==='confirmed'&&!assigned.has(person.id));
    if(!people.length)return [];
    const required=people.filter(person=>person.seatRequired).length;
    const familyTables=new Set(event.people.filter(person=>person.groupId===group.id&&assigned.has(person.id)).map(person=>assigned.get(person.id)!));
    const options=event.tables.map(table=>({table,free:table.capacity-(used.get(table.id)??0),withFamily:familyTables.has(table.id)}))
      .filter(option=>option.free>=required)
      .sort((a,b)=>Number(b.withFamily)-Number(a.withFamily)||a.free-b.free||a.table.name.localeCompare(b.table.name,'es',{numeric:true}));
    return [{group,people,required,option:options[0]??null,existingTables:event.tables.filter(table=>familyTables.has(table.id))}];
  });
}

export function serviceReview(event:EventView) {
  const confirmed=event.people.filter(person=>person.attendance==='confirmed');
  const pendingMenu=confirmed.filter(person=>!person.menu?.trim()||/^(pendiente|a confirmar)$/i.test(person.menu.trim()));
  const stepFree=confirmed.filter(person=>person.accessibilityNeeds?.includes('step_free_access'));
  const restricted=confirmed.filter(person=>person.dietaryRestriction?.trim());
  return {confirmed,pendingMenu,stepFree,restricted,withheld:restricted.filter(person=>!person.shareDietaryRestriction),breakdown:placeBreakdown(confirmed)};
}
