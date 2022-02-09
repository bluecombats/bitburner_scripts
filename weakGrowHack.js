/** @param {NS} ns **/
export async function main(ns) {
	var server = ns.args[0];
	var servers = ns.scan();
	servers.push(server);
	var maxThreads = ns.args[1];
	var countGrow,i;
	var maxMoney =102;
	while(maxMoney>100){
		maxMoney = 0;
		for(i=0; i<servers.length; i++){
			server = servers[i];
			countGrow=0;
			if(ns.getServerMoneyAvailable(server)>maxMoney){
				maxMoney = ns.getServerMoneyAvailable(server);
			}
			while(ns.getServerMoneyAvailable(server)>100){
				while(ns.getServerSecurityLevel(server)>ns.getServerMinSecurityLevel(server)){
					await ns.weaken(server,{ threads: maxThreads });
				}
				while(ns.getServerMaxMoney(server)<ns.getServerMoneyAvailable(server) && countGrow<10){
					await ns.grow(server,{ threads: maxThreads });
					while(ns.getServerSecurityLevel(server)>ns.getServerMinSecurityLevel(server)){
						await ns.weaken(server,{ threads: maxThreads });
					}
					countGrow+=1;
				}
				await ns.hack(server,{ threads: maxThreads });
			}
		}
	}
}
