/** @param {NS} ns **/
export async function main(ns) {
	var server = ns.args[0];
	var threads = ns.args[1];
	var countWeak;
	while(ns.getServerMoneyAvailable(server)>100){
		countWeak=0;
		while(ns.getServerSecurityLevel(server)>ns.getServerMinSecurityLevel(server) && countWeak<10){
			await ns.weaken(server,{ threads: threads });
			countWeak+=1;
		}
		await ns.grow(server,{ threads: threads });
		await ns.grow(server,{ threads: threads });
		await ns.hack(server,{ threads: threads });
	}
}
