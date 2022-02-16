/** @param {NS} ns **/
export async function main(ns) {
	var server = ns.args[0];
	var MaxThreads = ns.args[1];
	var servers = ns.scan();
	servers.push(server);
	var maxMoney=102;
	while (maxMoney>100){
		maxMoney=0;
		for(var i=0; i<servers.length; i++){
			server = servers[i];
			if(ns.hasRootAccess(server)){
				if(ns.getServerMaxMoney(server)>100){
					maxMoney = ns.getServerMaxMoney(server);
				}
				//weaken
				while((ns.getServerSecurityLevel(server) - ns.weakenAnalyze(MaxThreads)) 
				>= ns.getServerMinSecurityLevel(server)){
					await ns.weaken(server,{ threads: MaxThreads });
				}
				//grow, weaken
				while(ns.getServerMoneyAvailable(server)<ns.getServerMaxMoney(server)){
					await ns.grow(server,{ threads: MaxThreads });
					//weaken
					while((ns.getServerSecurityLevel(server) - ns.weakenAnalyze(MaxThreads)) 
					>= ns.getServerMinSecurityLevel(server)){
						await ns.weaken(server,{ threads: MaxThreads });
					}
				}
				//hack
				await ns.hack(server,{ threads: MaxThreads });
			}
		}
	}
}
