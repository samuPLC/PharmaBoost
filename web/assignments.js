export const colombiaDay=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Bogota',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
export function workPromotions(promotions,user,day=colombiaDay()){
 if(user.role!=='agente')return promotions;
 return promotions.filter(p=>p.agent_ids?.includes(user.id)&&p.manufacturer_id===user.manufacturer_id&&p.status==='activa'&&p.start_date<=day&&p.end_date>=day);
}
