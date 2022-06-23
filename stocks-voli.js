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
    var maxShares, i, smb, smbStr, minMoney=200000, preValue=[], currentValue=[], position=0, count=[], rand;
    for(i=0; i<symbols.length; i++){
        count[i]=0;
    }
    //ns.tprint(symbols.length," symbols length")
    rand = Math.floor(Math.random()*(symbols.length-1));
    while(ns.getPlayer()["money"]>0){
        ns.print("money @ start: ",Moneyformat(ns.getPlayer()["money"]));
        await delay(3000);
        if(ns.stock.getPosition(symbols[rand])[0] == 0){
            rand = Math.round(Math.random()*(symbols.length-1));
        }
        ns.print("rand: ",rand," smb:",symbols[rand]);
        for(i=0; i<symbols.length; i++){
            smb = symbols[i];
		    smbStr = smb + "   ";
		    smbStr = smbStr.substr(0,5);
            //ns.print(smbStr," count: ",count[i]);
			if(position==0){
				preValue[i] = (ns.stock.getAskPrice(smb)+ns.stock.getBidPrice(smb))/2;
				currentValue[i] = preValue[i];
			}else{
				currentValue[i] = (ns.stock.getAskPrice(smb)+ns.stock.getBidPrice(smb))/2;
				position= -1;
			}
            //ns.tprint(smbStr," long pos: ",ns.stock.getPosition(smb)[0]);
            //if I have no long stocks, then buy
            if(i == rand && ns.stock.getPosition(symbols[rand])[0]==0){				
                //ask price is buy price, and bid price is sell price
                ns.print(Moneyformat(currentValue[i])," ",Moneyformat(preValue[i]))
                if(ns.getPlayer()["money"]>(minMoney+100000) 
                && currentValue[i]>preValue[i]){
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
                    ns.print(smbStr," MShares: ",j, " price: ",Moneyformat(j*ns.stock.getAskPrice(smb)));
                    if((ns.getPlayer()["money"]-(j *ns.stock.getAskPrice(smb)))>(minMoney+100000) && j>10){
                        ns.print("buy ",smb, ": ",j);
                        ns.stock.buy(smb,j);
                    }
                }
            }
            //else sell
            else if(ns.stock.getPosition(smb)[0] > 0){
				count[i]+=1;
                maxShares = ns.stock.getPosition(smb)[0];
                ns.print(smbStr," Lpos: ",ns.stock.getPosition(smb)[0]
                    , " Gain: ", Moneyformat(ns.stock.getSaleGain(smb,maxShares,"Long")));
				ns.print(smbStr," prev: ",Moneyformat(preValue[i])," Curr: ",Moneyformat(currentValue[i])
				," count: ",count[i]);
                if(ns.stock.getSaleGain(smb,maxShares,"Long") > 0 && currentValue[i]<preValue[i]
				&& count[i]>30){
                    //maxShares*ns.stock.getBidPrice(smb)
                    ns.print("sell ",smb," SaleGain: ",Moneyformat(ns.stock.getSaleGain(smb,maxShares,"Long")))
                    ns.stock.sell(smb, maxShares);
					count[i]=0;
                }
            }
        }
        ns.print("money @ end: ",Moneyformat(ns.getPlayer()["money"]));
		position+=1;
    }
}