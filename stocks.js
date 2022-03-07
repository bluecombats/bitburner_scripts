/** @param {NS} ns **/
function delay(milliseconds){
    return new Promise(resolve => {
        setTimeout(resolve, milliseconds);
    });
}
export async function main(ns) {
	var symbols = ns.stock.getSymbols();
    var maxShares,i,smb,smbStr,minMoney=200000;
    while(ns.getPlayer()["money"]>minMoney){
        ns.print("money @ start: ",ns.getPlayer()["money"]);
        await delay(3000);
        for(i=0; i<symbols.length; i++){
            smb = symbols[i];
		    smbStr = smb + "   ";
		    smbStr = smbStr.substr(0,5);
            //ns.tprint(smbStr," long pos: ",ns.stock.getPosition(smb)[0]);
            //if I have no long stocks, then buy       
            if(ns.stock.getPosition(smb)[0] == 0){
                if(ns.stock.getVolatility(smb)<1){
                    //ns.print(smbStr," for: ",ns.stock.getForecast(smb));
                    if(ns.stock.getForecast(smb)>0.60 && ns.getPlayer()["money"]>(minMoney+100000)){
                        maxShares = (ns.getPlayer()["money"]-minMoney+100000)/ns.stock.getAskPrice(smb);
                        maxShares = Math.floor(maxShares);
                        if(maxShares>ns.stock.getMaxShares(smb)){
                            maxShares = ns.stock.getMaxShares(smb);
                        }
                        for(var j=maxShares;maxShares>0;j--){
                            //ns.print(smb," ",j);
                            if((ns.getPlayer()["money"]-(j *ns.stock.getAskPrice(smb)))>(minMoney+100000)){
                                break;
                            }
                        }
                        ns.print(smbStr," MShares: ",j, " price: ",j*ns.stock.getAskPrice(smb));
                        if((ns.getPlayer()["money"]-(j *ns.stock.getAskPrice(smb)))>(minMoney+100000)){
                            ns.print("buy ",smb, ": ",j);
                            ns.stock.buy(smb,j);
                        }
                    }
                }
            }
            //else sell
            else{
                ns.print(smbStr," Lpos: ",ns.stock.getPosition(smb)[0]," for: ",ns.stock.getForecast(smb));
                if(ns.stock.getForecast(smb)<0.5){
                    maxShares = ns.stock.getPosition(smb)[0];
                    ns.print("sell ",smb," price: ",maxShares*ns.stock.getAskPrice(smb))
                    ns.stock.sell(smb, maxShares);
                }
            }
        }
        ns.print("money @ end: ",ns.getPlayer()["money"]);
    }
}