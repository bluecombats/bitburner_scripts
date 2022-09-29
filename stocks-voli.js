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
    linearLeastSq(ns,price);
}
function linearLeastSq(ns,price){
	var meanX,meanY,a,b,y=0,x=0,x2=0,xy=0,n,i;
	n=price.length;
	for(i=0; i<price.length-1; i++){
		x2+=Math.pow(price[i],2);
		xy+=(i+1)*price[i];
		x+=(i+1);
		y+=price[i];
	}
	meanX=x/(price.length);
	meanY=y/(price.length);
	b = (xy*n - meanY*x)/(x2*n - meanX * x);
	a = (meanY - b*meanX)/n;
    //ns.print("y = ",a,"x + ",Moneyformat(b));
    return [a,b];
}
function findRand(ns,price,symbols,minLength){
    var rand, randCount=0,gain,maxGrain,i;
    for(i=0; i<symbols.length; i++){
        if(ns.stock.getPosition(symbols[i])[0]>0){
            rand = i;
            randCount+=1;
        }
    }
    if(randCount == 0 && price[0].length > minLength){
        maxGrain=0;
        for(i=0; i<symbols.length; i++){
            gain = linearLeastSq(ns,price[i]);
            if (gain[0]>maxGrain){
                maxGrain = gain[0];
                rand = i;
            }
        }
    }else if(randCount == 0){
        rand = Math.floor(Math.random()*(symbols.length-1));
    }
    return rand;
}
export async function main(ns) {
	var symbols = ns.stock.getSymbols();
    var maxShares, i, j, smb, smbStr, minMoney=200000, priceValue=[], rand, randCount=0;
    var minLength = 20,gain;

    for(i=0; i<symbols.length; i++){
        priceValue[i]=[];
    }
    rand = findRand(ns,priceValue,symbols,minLength);
    while(ns.getPlayer()["money"]>0){
        await delay(1000*6);
        rand = findRand(ns,priceValue,symbols,minLength);
        ns.print("money @ start: ",Moneyformat(ns.getPlayer()["money"]));
        ns.print("syb length: ",priceValue[0].length," smb:",symbols[rand]);
        for(i=0; i<symbols.length; i++){
            smb = symbols[i];
		    smbStr = smb + "   ";
		    smbStr = smbStr.substr(0,5);
            
            //position to work out curve using 3 points
			priceValue[i].push((ns.stock.getAskPrice(smb)+ns.stock.getBidPrice(smb))/2);
            //ns.tprint(smbStr," long pos: ",ns.stock.getPosition(smb)[0]);
            //if I have no long stocks, then buy
            gain = linearLeastSq(ns,priceValue[i]);
            if(i == rand && ns.stock.getPosition(symbols[rand])[0]==0 && priceValue[i].length > minLength){				
                //ask price is buy price, and bid price is sell price

                if(ns.getPlayer()["money"]>(minMoney+100000) && gain[0] >100){
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
                        ns.stock.buyStock(smb,j);
                    }
                }
            }
            //else sell
            else if(ns.stock.getPosition(smb)[0] > 0 && priceValue[i].length > minLength){
                maxShares = ns.stock.getPosition(smb)[0];
                ns.print(smbStr," Lpos: ",ns.stock.getPosition(smb)[0]
                    , " MaxGain: ", Moneyformat(ns.stock.getSaleGain(smb,maxShares,"Long"))
                    ," gain ax: ",gain[0], " b: ",gain[1]);				
                ns.print(smbStr," count: ",priceValue[i].length);

                //sell if gain > 0 and curve is negative and count > 30
                if(ns.stock.getSaleGain(smb,maxShares,"Long") > 0 && priceValue[i].length > minLength
                && gain[0] <50){
                    ns.print("sell ",smb," SaleGain: ",Moneyformat(ns.stock.getSaleGain(smb,maxShares,"Long")))
                    ns.stock.sellStock(smb, maxShares);
                }
            }
            //keep price array per symbol 100 length, remove 1st value
            if(priceValue[i].length > minLength){
                priceValue[i].shift();
                //ns.print(smbStr,priceValue[i].length);
            }
        }
        //ns.print("money @ end: ",Moneyformat(ns.getPlayer()["money"]));
    }
}
