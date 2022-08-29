/** @param {NS} ns **/
function delay(milliseconds){
    return new Promise(resolve => {
        setTimeout(resolve, milliseconds);
    });
}
function Moneyformat(money){
    var moneySplit;
    if(Math.abs(money/Math.pow(10,12)) >1){
        moneySplit = money/Math.pow(10,12);
        return "$"+String(moneySplit).substr(0,7)+"tr";
    }
    else if(Math.abs(money/Math.pow(10,9)) >1){
        moneySplit = money/Math.pow(10,9);
        return "$"+String(moneySplit).substr(0,7)+"bn";
    }else if(Math.abs(money/Math.pow(10,6)) >1){
        moneySplit = money/Math.pow(10,6);
        return "$"+String(moneySplit).substr(0,7)+"m";
    }else if(Math.abs(money/Math.pow(10,3)) >1){
        moneySplit = money/Math.pow(10,3);
        return "$"+String(moneySplit).substr(0,7)+"k";
    }
    else{
        return "$"+String(money);
    }
}
export async function main(ns) {
	var symbols = ns.stock.getSymbols();
    var maxShares,i,smb,smbStr,minMoney=200000;
    while(ns.getPlayer()["money"]>0){
        ns.print("money @ start: ",Moneyformat(ns.getPlayer()["money"]));
        await delay(3000);
        for(i=0; i<symbols.length; i++){
            smb = symbols[i];
		    smbStr = smb + "   ";
		    smbStr = smbStr.substr(0,5);
            //ns.tprint(smbStr," long pos: ",ns.stock.getPosition(smb)[0]);
            //if I have no long stocks, then buy       
            if(ns.stock.getPosition(smb)[0] == 0){
                //ask price is buy price, and bid price is sell price
                if(ns.stock.getVolatility(smb)<1){
                    //ns.print(smbStr," for: ",String(ns.stock.getForecast(smb)).substr(0,4));
                    if(ns.stock.getForecast(smb)>0.60 && ns.getPlayer()["money"]>(minMoney+100000)){
                        maxShares = (ns.getPlayer()["money"]-minMoney+100000)/ns.stock.getAskPrice(smb);
                        maxShares = Math.floor(maxShares);
                        if(maxShares>ns.stock.getMaxShares(smb)){
                            maxShares = ns.stock.getMaxShares(smb);
                        }
                        ns.print(smbStr," MaxShares: ",ns.stock.getMaxShares(smb)," calcMaxShares: ",maxShares);
                        for(var j=maxShares;maxShares>0;j--){
                            //ns.print(smb," ",j);
                            if((ns.getPlayer()["money"]-(j *ns.stock.getAskPrice(smb)))>(minMoney+100000)){
                                break;
                            }
                        }
                        ns.print(smbStr," MShares: ",j, " price: ",j*ns.stock.getAskPrice(smb));
                        if((ns.getPlayer()["money"]-(j *ns.stock.getAskPrice(smb)))>(minMoney+100000) && j>10){
                            ns.print("buy ",smb, ": ",j);
                            ns.stock.buyStock(smb,j);
                        }
                    }
                }
            }
            //else sell
            else{
                maxShares = ns.stock.getPosition(smb)[0];
                ns.print(smbStr," for: ",String(ns.stock.getForecast(smb)).substr(0,4)," Lpos: ",ns.stock.getPosition(smb)[0]
                    , " Gain: ", Moneyformat(ns.stock.getSaleGain(smb,maxShares,"Long")));
                if(ns.stock.getForecast(smb)<0.5 && ns.stock.getSaleGain(smb,maxShares,"Long") > 0){
                    //maxShares*ns.stock.getBidPrice(smb)
                    ns.print("sell ",smb," SaleGain: ",ns.stock.getSaleGain(smb,maxShares,"Long"))
                    ns.stock.sellStock(smb, maxShares);
                }
            }
        }
        ns.print("money @ end: ",Moneyformat(ns.getPlayer()["money"]));
    }
}
