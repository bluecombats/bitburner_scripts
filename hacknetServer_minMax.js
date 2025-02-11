/** @param {NS} ns */
function delay(milliseconds){
    return new Promise(resolve => {
        setTimeout(resolve, milliseconds);
    });
}
function numberFormat(x){
    var moneySplit;
    if(Math.abs(x/Math.pow(10,12)) >1){
        moneySplit = x/Math.pow(10,12);
        return String(moneySplit).substring(0,6)+"tr";
    }
    else if(Math.abs(x/Math.pow(10,9)) >1){
        moneySplit = x/Math.pow(10,9);
        return String(moneySplit).substring(0,6)+"bn";
    }else if(Math.abs(x/Math.pow(10,6)) >1){
        moneySplit = x/Math.pow(10,6);
        return String(moneySplit).substring(0,7)+"m";
    }else if(Math.abs(x/Math.pow(10,3)) >1){
        moneySplit = x/Math.pow(10,3);
        return String(moneySplit).substring(0,7)+"k";
    }else if(x<Math.pow(10,3)){
        return String(x).substring(0,8);
    }
    else{
        return String(x).substring(0,8);
    }
}
export async function main(ns) {	
	var num_nodes;
	let total_produced, hacknetProduction;
	let i,j,count=0;
	let delay_time = 1;
	let servers = [
		"iron-gym",
		"harakiri-sushi",
		"hong-fang-tea",
		"joesguns",
		"sigma-cosmetics",
		"foodnstuff",
		"n00dles"
	];
	let hash_upgrades=[
		//"Sell for Money",
		//"Sell for Corporation Funds",
		"Reduce Minimum Security",
		"Increase Maximum Money",
		//"Improve Studying",
		//"Improve Gym Training",
		//"Exchange for Corporation Research",
		//"Exchange for Bladeburner Rank",
		//"Exchange for Bladeburner SP",
		//"Generate Coding Contract",
		//"Company Favor"
		];
	ns.disableLog("getServerMaxMoney");
	ns.disableLog("getServerMinSecurityLevel");
	while(count<servers.length){
		count=0;
		num_nodes = ns.hacknet.numNodes();
		total_produced=0;
		hacknetProduction=0;
		// for(i=0; i<num_nodes; i++){
		// 	total_produced+=ns.hacknet.getNodeStats(i)["totalProduction"];
		// 	hacknetProduction += ns.hacknet.getNodeStats(i)["production"];
		// }
		// ns.print("Hash Rate ", hacknetProduction);
		ns.print("Hashs: ", numberFormat(ns.hacknet.hashCapacity()),"/"+
			numberFormat(ns.hacknet.numHashes()));
		// ns.print(ns.hacknet.getHashUpgrades());
		// ns.print(numberFormat(Math.pow(10,12)+2));
		for(i=0;i<servers.length;i++){
			ns.print(servers[i]," max money $",numberFormat(ns.getServerMaxMoney(servers[i])));
			ns.print(servers[i]," min secruity: ",ns.getServerMinSecurityLevel(servers[i]));
			for(j=0;j<hash_upgrades.length;j++){
				ns.print(hash_upgrades[j]," ",numberFormat(ns.hacknet.hashCost(hash_upgrades[j], 1)))
				if(ns.hacknet.numHashes()>ns.hacknet.hashCost(hash_upgrades[j], 1)){
					if(("Reduce Minimum Security" == hash_upgrades[j] && ns.getServerMinSecurityLevel(servers[i])>1) ||
					("Increase Maximum Money"== hash_upgrades[j] && ns.getServerMaxMoney(servers[i])<Math.pow(10,12))){
						ns.print("spent on ",servers[i], " ", hash_upgrades[j]);
						ns.hacknet.spendHashes(hash_upgrades[j], servers[i], 1)
					}
				}
			}
			if(ns.getServerMaxMoney(servers[i])>Math.pow(10,12) && ns.getServerMinSecurityLevel(servers[i])<=1.01){
				count+=1;
			}
			else{
				break;
			}
		}
		await delay(1000*delay_time);
	}
}
