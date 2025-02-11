/** @param {NS} ns **/
// function delay(milliseconds){
//     return new Promise(resolve => {
//         setTimeout(resolve, milliseconds);
//     });
// }
function numberFormat(money){
    var moneySplit, return_string;
    if(Math.abs(money/Math.pow(10,12)) >1){
        moneySplit = Math.abs(money)/Math.pow(10,12);
        return_string= String(moneySplit).substring(0,6)+"tr";
    }
    else if(Math.abs(money/Math.pow(10,9)) >1){
        moneySplit = Math.abs(money)/Math.pow(10,9);
        return_string=String(moneySplit).substring(0,6)+"bn";
    }else if(Math.abs(money/Math.pow(10,6)) >1){
        moneySplit = Math.abs(money)/Math.pow(10,6);
        return_string=String(moneySplit).substring(0,7)+"m";
    }else if(Math.abs(money/Math.pow(10,3)) >1){
        moneySplit = Math.abs(money)/Math.pow(10,3);
        return_string=String(moneySplit).substring(0,7)+"k";
    }
    else{
        return_string=String(Math.abs(money));
    }
		return return_string
}
function percFormat(ns,perc){
	//make sure it is of the form:
	// +0#.##%
	// -0#.##%
	let perc_string,per_decimals;
	if(Math.abs(perc/Math.pow(10,1)) >1){
		perc_string = Math.abs(Math.trunc(perc));
	}else{
		perc_string = "0"+Math.abs(Math.trunc(perc));
	}
	per_decimals = Math.trunc(Math.abs(perc-Math.trunc(perc))*100);
	if((per_decimals/Math.pow(10,1)) <1){
		per_decimals="0"+per_decimals;
	}
	perc_string+= "."+String(per_decimals).substring(0,2)+"%";
	if(Math.sign(perc)==1){
		perc_string=" "+perc_string;
	}else{
		perc_string="-"+perc_string;
	}
	return perc_string;
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
    ," salesGain: $",numberFormat(salesGain)
    ," My Money: $",numberFormat(ns.getPlayer()["money"]));
    return rand;
}
export async function main(ns) {
	const symbols = ns.stock.getSymbols();
	const stock_con = ns.stock.getConstants();
	let maxShares,i,smb,smbStr,minMoney=200000,rand,orders,position,total_cost,sales_gain;
	rand = generateRand(ns,symbols);
	while(ns.getPlayer()["money"]>0){
		await ns.stock.nextUpdate();
		ns.print("money @ start: $",numberFormat(ns.getPlayer()["money"]));
		for(i=0; i<symbols.length; i++){
			smb = symbols[i];
			smbStr = smb + "   ";
			smbStr = smbStr.substring(0,5);
			position = ns.stock.getPosition(smb);
			maxShares = (ns.getPlayer()["money"]-minMoney-stock_con["StockMarketCommission"])/ns.stock.getAskPrice(smb);
			maxShares = Math.floor(maxShares);
			if(maxShares>ns.stock.getMaxShares(smb)){
				maxShares = ns.stock.getMaxShares(smb);
			}
			//if I have no long stocks, then buy if vol <=1.5 forecast is >0.6 and I can afford it
			if(position[0] == 0 && ns.stock.getVolatility(smb)<=0.012 && ns.stock.getForecast(smb)>0.60 &&
				ns.getPlayer()["money"]>(stock_con["StockMarketCommission"] +minMoney)){
				for(var j=maxShares;maxShares>0;j--){
					//ns.print(smb," ",j);
					if((ns.getPlayer()["money"]-(j *ns.stock.getAskPrice(smb)))>(
						minMoney+stock_con["StockMarketCommission"])){
						break;
					}
				}
				ns.print(smbStr," MShares: ",j, " price: $",numberFormat(j*ns.stock.getAskPrice(smb)));
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
				let profit = (sales_gain-total_cost)+stock_con["StockMarketCommission"];
				let profit_perc = (profit/total_cost)*100;
				ns.print(smbStr
					," for:  ",percFormat(ns, ns.stock.getForecast(smb)*100)
					,"  vol:  ",percFormat(ns, ns.stock.getVolatility(smb)*100)
					,"  Total: $",numberFormat( total_cost)
					,"  Profit: $",numberFormat( profit)
					,"  ",percFormat(ns, profit_perc)
					,"  Gain: $", numberFormat(sales_gain)
					,"  shares: ",numberFormat(position[0])
				);
				if(ns.stock.getForecast(smb)<0.5 && sales_gain > 0){
					ns.print("sell ",smb," SaleGain: $",numberFormat(sales_gain));
					ns.stock.sellStock(smb, maxShares);
				}
			}
		}
		rand = generateRand(ns,symbols);
		ns.print("money @ end: ",numberFormat(ns.getPlayer()["money"]));
	}
}
