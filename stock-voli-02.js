/** @param {NS} ns **/
function delay(milliseconds){
    return new Promise(resolve => {
        setTimeout(resolve, milliseconds);
    });
}
function numberFormat(money){
    var moneySplit;
    if(Math.abs(money/Math.pow(10,12)) >1){
        moneySplit = money/Math.pow(10,12);
        return String(moneySplit).substring(0,6)+"tr";
    }
    else if(Math.abs(money/Math.pow(10,9)) >1){
        moneySplit = money/Math.pow(10,9);
        return String(moneySplit).substring(0,6)+"bn";
    }else if(Math.abs(money/Math.pow(10,6)) >1){
        moneySplit = money/Math.pow(10,6);
        return String(moneySplit).substring(0,7)+"m";
    }else if(Math.abs(money/Math.pow(10,3)) >1){
        moneySplit = money/Math.pow(10,3);
        return String(moneySplit).substring(0,7)+"k";
    }
    else{
        return String(money).substring(0,8);
    }
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
function algorithm_stock_trader_i(data, comm_fee){
	//one transaction
	var answer=0, transaction,i,j, path;
	for(i=0; i<data.length; i++){
		for(j=i+1; j<data.length; j++){
			transaction = data[j] - data[i];
			if(transaction>answer){
				answer = transaction;
				path=[i,j];
			}
		}
	}
	return [answer, path];
}
function algorithm_stock_trader_ii(data){
	//as many transactions as you want, one at a time though
	var answer=0,i,j,transaction,prev_j;
	for(i=0;i<data.length-1;i++){
		transaction=0;
		for(j=0;j<data.length-i;j++){
			prev_j = data[i+j]
			if(data[i+j]>data[i] && (data[i+j]-data[i])>transaction){
				transaction = data[i+j]-data[i];
			}
		}
		i += j+1;
		answer += transaction;
	}
	return answer
}
function sell_stock(ns, symbols, stock_con){
	let smb_position, sales_gain, total_cost, profit, profit_perc, i;
	let sell = false;
	for(i=0; i<symbols.length; i++){
		//long position
		smb_position = ns.stock.getPosition(symbols[i]);
		if(smb_position[0]>0){
			sales_gain = ns.stock.getSaleGain(symbols[i],smb_position[0],"Long");
			let total_cost = smb_position[0] * smb_position[1];
			let profit = (sales_gain - total_cost) + stock_con["StockMarketCommission"];
			let profit_perc = (profit/total_cost)*100;
			ns.print(symbols[i],
				" Total Long: $",numberFormat(total_cost),
				" Gain: $", numberFormat(sales_gain),
				" Profit: $",numberFormat(profit),
				// " ",profit_perc,
				" ",percFormat(ns, profit_perc),
				" shares: ",numberFormat(smb_position[0]),
			);
			if(profit_perc > 10){
				sell = true;
				ns.print("SELL");
				ns.toast(`SELL ${symbols[i]}`,"info",1000*2)
				ns.stock.sellStock(symbols[i], smb_position[0]);
			}
		}
		//short position
		if(smb_position[2]>0){
			sales_gain = ns.stock.getSaleGain(symbols[i],smb_position[2],"Short");
			let total_cost = smb_position[2]*smb_position[3];
			ns.print(symbols[i],
				"  Total Short: $",numberFormat(total_cost),
				"  Gain: $", numberFormat(sales_gain),
				"  shares: ",numberFormat(smb_position[2]),
			);
		}
	}
	return sell;
}
export async function main(ns) {
	const symbols = ns.stock.getSymbols();
	const stock_con = ns.stock.getConstants();
  let maxShares, i, j, smb, smbStr;
	let response, paths=[], profit=[];
	let maxprofit, position, smb_position, desiredpath;
  let gain, gainArray=[], data=[], money_Gain=[], sales_gain;
	let training_price=[];
	let tick, tick_rem;

	while(ns.getPlayer()["money"]>0){
		for(i=0; i<symbols.length; i++){
			training_price[i]=[];
		}
		/*
			long - you buy at ask price, and sell at bid price
			short - you buy at bid price and sell at ask price
			spread - ask price - bid price
		*/
		tick=0;
		ns.print("getting training data");
		for(i=0; i<symbols.length; i++){
			training_price[i]=[];
		}
		ns.print("getting training data");
		while(tick< stock_con["TicksPerCycle"]*2){
			tick+=1;
			await ns.stock.nextUpdate();
			ns.print("getting training data: ",stock_con["TicksPerCycle"]*2," ",tick);
			for(i=0; i<symbols.length; i++){
				training_price[i].push(ns.stock.getPrice(symbols[i]))
			}
		}
		while(ns.getPlayer()["money"]>0){
			await ns.stock.nextUpdate();
			tick+=1;
			tick_rem = tick % (stock_con["TicksPerCycle"]*2);
			money_Gain=[];
			ns.print("money @ start: $",numberFormat(ns.getPlayer()["money"]));
			ns.print("syb length: ",training_price[0].length,
					" tick_rem ",tick_rem
			);
			//analysis
			paths=[];
			profit=[];
			for(i=0; i<symbols.length; i++){
				response = algorithm_stock_trader_i(training_price[i],stock_con["StockMarketCommission"]);
				profit.push(response[0]);
				paths.push(response[1]);
				// ns.print(symbols[i]," profit: $",numberFormat(response[0]), " path: ", response[1]);
			}
			//find the max profit
			maxprofit = Math.max(...profit);
			position = profit.indexOf(maxprofit);
			desiredpath = paths[position];
			smb = symbols[position];
			ns.print(smb," Max profit: $",numberFormat(maxprofit), " path: ", desiredpath);
			ns.print(tick," ",tick_rem," ",smb,
				" train price: $",numberFormat(training_price[position][tick_rem]),
				" current price: $",numberFormat(ns.stock.getPrice(smb))
			);
			
			//buy
			if(tick_rem == desiredpath[0]){
				maxShares = (ns.getPlayer()["money"]-stock_con["StockMarketCommission"])/ns.stock.getAskPrice(smb);
				maxShares = Math.floor(maxShares);
				if(maxShares>ns.stock.getMaxShares(smb)){
					maxShares = ns.stock.getMaxShares(smb);
				}
				ns.print("buy ",smb, ": ",maxShares);
				ns.stock.buyStock(smb, maxShares);
			}

			//sell
			let sold = sell_stock(ns, symbols, stock_con);
			if(sold){
				break
			}
		}
	}
}
