export function JsonToString(date){
    const d=new Date(date);
    d.setDate(d.getDate()+1);
    const stringDate=d.toISOString();
    const arr=stringDate.split("T");
   return arr[0];
   
}

export function StringToJson(date){
    const d=new Date(date);
    d.setDate(d.getDate()-1);
    d.setHours(24);
    const stringDate=d.toJSON();
    return stringDate;
}