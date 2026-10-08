export function unitPrice(product,quantity){
 const percent=Number(product.discount_percent||0),threshold=Number(product.discount_min||0);
 return Math.max(1,Math.round(Number(product.price)*(1-(threshold>0&&quantity>=threshold?percent:0)/100)));
}
