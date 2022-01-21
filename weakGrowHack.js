/** @param {NS} ns **/
export async function main(ns) {
	var server = ns.args[0];
	var maxThreads = ns.args[1];
	var countWeak;
	while(ns.getServerMoneyAvailable(server)>100){
		countWeak=0;
		while(ns.getServerSecurityLevel(server)>ns.getServerMinSecurityLevel(server) && countWeak<10){
			await ns.weaken(server,{ threads: maxThreads });
			countWeak+=1;
		}
		await ns.grow(server,{ threads: maxThreads });
		await ns.grow(server,{ threads: maxThreads });
		await ns.hack(server,{ threads: maxThreads });
	}
}
