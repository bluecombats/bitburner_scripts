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
function curve(prev, cur, fut, price, ns){
    ns.print("0: ",Moneyformat(prev));
    ns.print(Math.floor((price.length-1)/2),": ",Moneyformat(cur));
	ns.print((price.length-1),": ",Moneyformat(fut));
    if(cur<prev && fut<curve){
        ns.print("\\ : negative slope");
    }else if(cur>prev && fut>cur){
        ns.print("/ : positive slope");
    }else if(cur<prev && fut>cur){
        ns.print("\\/: low point");
    }else if(cur>prev && fut<cur){
        ns.print("/\\: high point");
    }else{
        ns.print("ERROR");
    }
}
export async function main(ns) {
	var symbols = ns.stock.getSymbols();
    var maxShares, i, j, smb, smbStr, minMoney=200000, priceValue=[], position=0, count=[], rand, prevRand;
    var prev, cur, fut, minLength = 20;
    for(i=0; i<symbols.length; i++){
        priceValue[i]=[];
        count[i]=0;
        if(ns.stock.getPosition(symbols[i])[0]>0){
            rand = i;
        }
    }
    if(!rand){
        rand = Math.floor(Math.random()*(symbols.length-1));
    }   
    while(ns.getPlayer()["money"]>0){
        ns.print("money @ start: ",Moneyformat(ns.getPlayer()["money"]));
        await delay(1000*6);
        ns.print("rand: ",rand," smb:",symbols[rand]);
        for(i=0; i<symbols.length; i++){
            smb = symbols[i];
		    smbStr = smb + "   ";
		    smbStr = smbStr.substr(0,5);
            
            //position to work out curve using 3 points
			priceValue[i].push((ns.stock.getAskPrice(smb)+ns.stock.getBidPrice(smb))/2);
            
            //calc prec, cur, fut
            if(priceValue[i].length > minLength){
                prev = priceValue[i][0];
                cur  = priceValue[i][Math.floor((priceValue[i].length-1)/2)];
                fut  = priceValue[i][(priceValue[i].length-1)];
            }
            //ns.tprint(smbStr," long pos: ",ns.stock.getPosition(smb)[0]);
            //if I have no long stocks, then buy
            if(i == rand && ns.stock.getPosition(symbols[rand])[0]==0 &&  priceValue[i].length > minLength){				
                //ask price is buy price, and bid price is sell price
                ns.print(smbStr," count: ",count[i]);
                curve(prev, cur, fut, priceValue[i], ns);

                if(ns.getPlayer()["money"]>(minMoney+100000)  
                && cur > prev
                && fut > cur){
					maxShares = (ns.getPlayer()["money"]-minMoney+100000)/ns.stock.getAskPrice(smb);
                    maxShares = Math.floor(maxShares);
                    if(maxShares > ns.stock.getMaxShares(smb)){
                        maxShares = ns.stock.getMaxShares(smb);
                    }
                    ns.print(smbStr," MaxShares: ",ns.stock.getMaxShares(smb)," calcMaxShares: ",maxShares);
                    for(j=maxShares; maxShares>0; j--){
                        if((ns.getPlayer()["money"]-(j *ns.stock.getAskPrice(smb)))>(minMoney+100000)){
                            break;
                        }
                    }
                    ns.print(smbStr," MShares: ",j, " price: ",Moneyformat(j*ns.stock.getAskPrice(smb)));
                    if((ns.getPlayer()["money"]-(j *ns.stock.getAskPrice(smb)))>(minMoney+100000) && j>10){
                        ns.print("buy ",smbStr, ": ",j);
                        ns.stock.buy(smb,j);
                    }
                }
            }
            //else sell
            else if(ns.stock.getPosition(smb)[0] > 0 && priceValue[i].length > minLength){
				count[i]+=1;
                maxShares = ns.stock.getPosition(smb)[0];
                ns.print(smbStr," Lpos: ",ns.stock.getPosition(smb)[0]
                    , " Gain: ", Moneyformat(ns.stock.getSaleGain(smb,maxShares,"Long")));				
                ns.print(smbStr," count: ",count[i]);
                curve(prev, cur, fut, priceValue[i], ns);

                //sell if gain > 0 and curve is negative and count > 30
                if(ns.stock.getSaleGain(smb,maxShares,"Long") > 0 
                && cur<prev
				&& fut<cur && count[i]>30){
                    //maxShares*ns.stock.getBidPrice(smb)
                    ns.print("sell ",smb," SaleGain: ",Moneyformat(ns.stock.getSaleGain(smb,maxShares,"Long")))
                    ns.stock.sell(smb, maxShares);
					count[i]=0;
                }
            }
            //check for saddle points and reset array
            if(((cur < prev && fut > cur) || (cur > prev && fut < cur)) && priceValue[i].length > minLength){
                if(cur < prev && fut > cur){
                    ns.print(smbStr,": low point, array rest");
                }
                if(cur > prev && fut < cur){
                    ns.print(smbStr,": high point, array rest");
                }
                priceValue[i] = [];
                //ns.print(priceValue[i]);
            }
        }
        //rand is exisiting sym if exists, otherwise random
        if(ns.stock.getPosition(symbols[rand])[0] == 0 && position == -1){
            prevRand = rand;
            var randCount = 0;
            for(i=0; i<symbols.length; i++){
                if(ns.stock.getPosition(symbols[i])[0]>0){
                    rand = i;
                    randCount+= 1;
                }
             }
            if(prevRand == rand && randCount == 0){
                rand = Math.floor(Math.random()*(symbols.length-1));
            }
        }
        //ns.print("money @ end: ",Moneyformat(ns.getPlayer()["money"]));
        //update position
		position+=1;
    }
}