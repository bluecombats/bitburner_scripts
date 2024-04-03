/** @param {NS} ns */
function delay(milliseconds){
    return new Promise(resolve => {
        setTimeout(resolve, milliseconds);
    });
}
function max_money(ns,servers){
	var server,i,max_money=0;
	for(i=0;i<servers.length;i++){
		if(servers[i]=="home"){
			continue;
		}
		if(ns.getServerMaxMoney(servers[i])>max_money && ns.hasRootAccess(servers[i])){
			server = servers[i];
			max_money = ns.getServerMaxMoney(servers[i]);
		}
	}
	return server;
}
export async function main(ns) {
	var server = ns.args[0];
	var threads = ns.args[1];
	var servers = ns.scan();
	var i;
	servers.push(server);
	while(server){
		server = max_money(ns,servers);
		ns.print("hack server: ",server);
		if(ns.hasRootAccess(server)){
			await ns.hack(server,{ threads: threads });
		}
		await delay(1000*1)
	}
}
