/** @param {NS} ns **/
function delay(milliseconds){
    return new Promise(resolve => {
        setTimeout(resolve, milliseconds);
    });
}
export async function main(ns) {
	var count = 0,i;
	var scan = ns.scan();
	var server,portsCount,threads,ramLeft;
	server = ns.getServer();
	scan.push(server["hostname"]);
	while(count<scan.length){
		count = 0;
		await delay(1000);
		for(i=0; i<scan.length; i++){
			//ns.tprint(scan[i]);
			threads=1;
			server = ns.getServer(scan[i]);
			/*{"cpuCores":1
			,"ftpPortOpen":false
			,"hasAdminRights":false
			,"hostname":"foodnstuff"
			,"httpPortOpen":false
			,"ip":"9.5.4.8"
			,"isConnectedTo":false
			,"maxRam":16
			,"organizationName":"FoodNStuff"
			,"ramUsed":0
			,"smtpPortOpen":false
			,"sqlPortOpen":false
			,"sshPortOpen":false
			,"purchasedByPlayer":false
			,"backdoorInstalled":false
			,"baseDifficulty":10
			,"hackDifficulty":10
			,"minDifficulty":3
			,"moneyAvailable":2000000
			,"moneyMax":50000000
			,"numOpenPortsRequired":0
			,"openPortCount":0
			,"requiredHackingSkill":1
			,"serverGrowth":5}*/
			if(ns.hasRootAccess(scan[i])){
				count+=1;
				if(!ns.fileExists("serverHack.js",scan[i])){
					await ns.scp("serverHack.js",scan[i]);
					await ns.exec("serverHack.js",scan[i], 1);
				}
				ramLeft = server["maxRam"] - server["ramUsed"];
				if(ramLeft>=32)		{threads=12}
				else if(ramLeft>=16)	{threads=6}
				else if(ramLeft>=8)	{threads=3}
				else if(ramLeft>=4)	{threads=1}
				if(!ns.fileExists("weakGrowHack.js",scan[i])){
					await ns.scp("weakGrowHack.js",scan[i]);
				}
				if(!ns.scriptRunning("weakGrowHack.js",scan[i])){
					await ns.exec("weakGrowHack.js",scan[i], threads, scan[i], threads);
				}				
			}
			else if(ns.getHackingLevel()>=ns.getServerRequiredHackingLevel(scan[i])){
				//how many ports are open
				if(!server["ftpPortOpen"] && ns.fileExists("FTPCrack.exe","home")){
					ns.ftpcrack(scan[i]);
				}
				if(!server["httpPortOpen"] && ns.fileExists("HTTPWorm.exe","home")){
					ns.httpworm(scan[i]);
				}
				if(!server["smtpPortOpen"] && ns.fileExists("relaySMTP.exe","home")){
					ns.relaysmtp(scan[i]);
				}
				if(!server["sshPortOpen"] && ns.fileExists("BruteSSH.exe","home")){
					ns.brutessh(scan[i]);
				}
				if(!server["sqlPortOpen"] && ns.fileExists("SQLInject.exe","home")){
					ns.sqlinject(scan[i]);
				}
				//can it be nuked
				portsCount = ns.getServer(scan[i])["openPortCount"];
				if(portsCount >= ns.getServerNumPortsRequired(scan[i])){
					ns.nuke(scan[i]);
				}
			}
		}
	}
}
