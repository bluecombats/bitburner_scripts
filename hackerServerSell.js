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
    }else if(money<Math.pow(10,3)){
        return "$"+String(money).substr(0,7);
    }
    else{
        return "$"+String(money);
    }
}
export async function main(ns) {
	//requires formulas.exe
	var count = 0,i=0,delay_time=0.25;
	var num_nodes = ns.hacknet.numNodes()
	var usedRam, hacknetNewNode, hacknetProduction;
	var level_per,core_per,ram_per, goal_value;

	while(count<100000){
		count+=1;
		hacknetProduction = 0;
		num_nodes = ns.hacknet.numNodes();
		for(i=0; i<num_nodes; i++){
			//ns.print(i);
			//usedRam = ns.getServerUsedRam(`hacknet-server-${i}`);
			hacknetProduction += ns.hacknet.getNodeStats(i)["production"]; 
		}
		ns.print("Total production per second ", hacknetProduction);
		ns.print("hashs: ", ns.hacknet.hashCapacity(),"/",ns.hacknet.numHashes());
		//sell hashes
		//ns.tprint("hash upgrades",ns.hacknet.getHashUpgrades());
		/*"Sell for Money",
		"Sell for Corporation Funds",
		"Reduce Minimum Security",
		"Increase Maximum Money",
		"Improve Studying",9
		"Improve Gym Training",
		"Exchange for Corporation Research",
		"Exchange for Bladeburner Rank",
		"Exchange for Bladeburner SP",
		"Generate Coding Contract",
		"Company Favor"*/
		var sellHash = (Math.floor(
			(hacknetProduction/
			ns.hacknet.hashCost("Sell for Money")
			)*delay_time))
		ns.print(`price for hashes to money ${ns.hacknet.hashCost("Sell for Money")}`);
		ns.print("buy ",sellHash);
		if(sellHash<1){
			ns.hacknet.spendHashes("Sell for Money")
		}else{
			ns.hacknet.spendHashes(
				"Sell for Money",
				"home",
				sellHash
			)};
		// }
		await delay(1000*delay_time);
	}
}
