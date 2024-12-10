/** @param {NS} ns **/
function delay(milliseconds){
    return new Promise(resolve => {
        setTimeout(resolve, milliseconds);
    });
}
function moneyFormat(ns,money){
    var moneySplit;
    if(Math.abs(money/Math.pow(10,12)) >1){
        moneySplit = money/Math.pow(10,12);
        return "$"+String(moneySplit).substring(0,7)+"tr";
    }
    else if(Math.abs(money/Math.pow(10,9)) >1){
        moneySplit = money/Math.pow(10,9);
        return "$"+String(moneySplit).substring(0,7)+"bn";
    }else if(Math.abs(money/Math.pow(10,6)) >1){
        moneySplit = money/Math.pow(10,6);
        return "$"+String(moneySplit).substring(0,7)+"m";
    }else if(Math.abs(money/Math.pow(10,3)) >1){
        moneySplit = money/Math.pow(10,3);
        return "$"+String(moneySplit).substring(0,7)+"k";
    }
    else{
        return "$"+String(money);
    }
}
function generateRand(ns,symbols){
    var rand, randCount=0,salesGain=0,i,maxShares,maxForecast=0;
    for(i=0; i<symbols.length; i++){
        if(ns.stock.getPosition(symbols[i])[0] > 0){
            randCount+=1;
            rand = i;
            maxShares = ns.stock.getPosition(symbols[i])[0];
            salesGain+=ns.stock.getSaleGain(symbols[i],maxShares,"Long");
        }
    }
    if(randCount == 0 || ns.getPlayer()["money"] > Math.pow(10,9)){
        for(i=0; i<symbols.length; i++){
            if(ns.stock.getVolatility(symbols[i])<1 
            && ns.stock.getForecast(symbols[i]) > maxForecast
            && ns.stock.getPosition(symbols[i])[0] == 0){
                maxForecast=ns.stock.getForecast(symbols[i]);
                rand = i;
            }
        }
    }
    ns.print("rand: ",symbols[rand]," randCount: ",randCount
    ," salesGain: ",moneyFormat(ns,salesGain)
    ," My Money: ",moneyFormat(ns,ns.getPlayer()["money"]));
    return rand;
}
export async function main(ns) {
	const symbols = ns.stock.getSymbols();
	const stock_con = ns.stock.getConstants();
	let maxShares,i,smb,smbStr,minMoney=200000,rand,orders,position,total_cost,sales_gain;
	rand = generateRand(ns,symbols);
	while(ns.getPlayer()["money"]>0){
		ns.print("money @ start: ",moneyFormat(ns,ns.getPlayer()["money"]));
		await ns.stock.nextUpdate();
		for(i=0; i<symbols.length; i++){
			smb = symbols[i];
			smbStr = smb + "   ";
			smbStr = smbStr.substring(0,5);
			position = ns.stock.getPosition(smb);
			//if I have no long stocks, then buy if vol <=1.5 forecast is >0.6 and I can afford it
			maxShares = (ns.getPlayer()["money"]-minMoney+stock_con["StockMarketCommission"])/ns.stock.getAskPrice(smb);
			maxShares = Math.floor(maxShares);
			if(maxShares>ns.stock.getMaxShares(smb)){
				maxShares = ns.stock.getMaxShares(smb);
			}
			// ns.print(`${smbStr} Pur: ${moneyFormat(ns,ns.stock.getPurchaseCost(smb,maxShares,"Long"))}`+
			// ` Sale: ${moneyFormat(ns,ns.stock.getSaleGain(smb,maxShares,"Long"))}`);
			if(position[0] == 0 && ns.stock.getVolatility(smb)<=1.5 && ns.stock.getForecast(smb)>0.60 &&
			ns.getPlayer()["money"]>ns.stock.getPurchaseCost(smb,maxShares,"Long") &&
			ns.stock.getSaleGain(smb,maxShares,"Long")>0){
				// ns.print(smbStr," MaxShares: ",ns.stock.getMaxShares(smb)," calcMaxShares: ",maxShares);
				for(var j=maxShares;maxShares>0;j--){
					//ns.print(smb," ",j);
					if((ns.getPlayer()["money"]-(j *ns.stock.getAskPrice(smb)))>(
						minMoney+stock_con["StockMarketCommission"])){
						break;
					}
				}
				ns.print(smbStr," MShares: ",j, " price: ",moneyFormat(ns,j*ns.stock.getAskPrice(smb)));
				if((ns.getPlayer()["money"]-(j *ns.stock.getAskPrice(smb)))>(
					minMoney+stock_con["StockMarketCommission"]) && j>10){
					ns.print("buy ",smb, ": ",j);
					ns.stock.buyStock(smb,j);
				}
			}
			//else sell
			else if(position[0] > 0){
				maxShares = ns.stock.getPosition(smb)[0];
				total_cost = position[0]*position[1];
				sales_gain = ns.stock.getSaleGain(smb, position[0],"Long");
				// sales_gain+= position[2]*position[3] - ns.stock.getSaleGain(smb,0,"Short");
				ns.print(smbStr," for: ",String(ns.stock.getForecast(smb)).substring(0,4)
					," Total: ",moneyFormat(ns,total_cost)
					," Profit: ",moneyFormat(ns,(sales_gain-total_cost)+stock_con["StockMarketCommission"])
					," Gain: ", moneyFormat(ns,sales_gain)
				);
				if(ns.stock.getForecast(smb)<0.5 && sales_gain > 0){
					ns.print("sell ",smb," SaleGain: ",moneyFormat(ns,sales_gain));
					ns.stock.sellStock(smb, maxShares);
				}
			}
		}
		rand = generateRand(ns,symbols);
		ns.print("money @ end: ",moneyFormat(ns,ns.getPlayer()["money"]));
	}
}
