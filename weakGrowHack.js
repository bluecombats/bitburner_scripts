/** @param {NS} ns **/
export async function main(ns) {
	var server = ns.args[0];
	var MaxThreads = ns.args[1];
	var servers = ns.scan();
	servers.push(server);
	var maxMoney=102;
	var growCount, curSecLvl, minSecLvl;
	while (maxMoney>100){
		maxMoney=0;
		for(var i=0; i<servers.length; i++){
			server = servers[i];
			if(server == "home"){continue}
			if(!ns.hasRootAccess(server)){continue}
			growCount=0;
				if(ns.getServerMaxMoney(server)>100){
					maxMoney = ns.getServerMaxMoney(server);
				}
				//weaken
				while((ns.getServerSecurityLevel(server)) > ns.getServerMinSecurityLevel(server)){
					curSecLvl = ns.getServerSecurityLevel(server);
					minSecLvl = ns.getServerMinSecurityLevel(server);
					for(var j=1; j<MaxThreads;j++){
						if((curSecLvl - ns.weakenAnalyze(j)) <= minSecLvl){
							break;
						}
					}
					await ns.weaken(server,{ threads: j });
				}
				//grow, weaken
				while(ns.getServerMoneyAvailable(server)<ns.getServerMaxMoney(server) && growCount<100){
					await ns.grow(server,{ threads: MaxThreads });
					//weaken
					while((ns.getServerSecurityLevel(server)) > ns.getServerMinSecurityLevel(server)){
						curSecLvl = ns.getServerSecurityLevel(server);
						minSecLvl = ns.getServerMinSecurityLevel(server);
						for(var j=1; j<MaxThreads;j++){
							if((curSecLvl - ns.weakenAnalyze(j)) <= minSecLvl){
								break;
							}
						}
						await ns.weaken(server,{ threads: j });
					}
					growCount+=1;
				}
				//hack
				await ns.hack(server,{ threads: MaxThreads });
		}
	}
}
