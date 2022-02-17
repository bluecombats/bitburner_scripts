/** @param {NS} ns **/
function delay(milliseconds){
    return new Promise(resolve => {
        setTimeout(resolve, milliseconds);
    });
}
export async function main(ns) {
	var symbols = ns.stock.getSymbols();
    var maxShares;
    while(ns.getPlayer()["money"]>200000){
        await delay(6000);
        for(var i=0; i<symbols.length; i++){
            var smb = symbols[i];
            if(ns.stock.getVolatility(smb)<1){
                //if I have no long stocks, then buy
                if(ns.stock.getPosition(smb)[0]==0){
                    if(ns.stock.getForecast(smb)>0.69){
                        maxShares = ns.getPlayer()["money"]/ns.stock.getPrice(smb);
                        ns.stock.buy(smb,Math.floor(maxShares));
                    }
                }
                //else sell
                else{
                    if(ns.stock.getForecast(smb)<0.31){
                        maxShares = ns.stock.getPosition(smb)[0];
                        ns.stock.sell(smb, maxShares);
                    }
                }
            }
        }
    }
}
