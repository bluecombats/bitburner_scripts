/** @param {NS} ns **/
export async function main(ns) {
	//while(true){
		//ns.connect("home");
		var scan=ns.scan();
		//ns.tprint(scan);
		var server,portsCount,threads;
		for(var i in scan){
			ns.tprint(scan[i]);
			threads=1;
			server = ns.getServer(scan[i]);
			//{"cpuCores":1,"ftpPortOpen":false,"hasAdminRights":false
			//,"hostname":"foodnstuff","httpPortOpen":false,"ip":"9.5.4.8"
			//,"isConnectedTo":false,"maxRam":16,"organizationName":"FoodNStuff"
			//,"ramUsed":0,"smtpPortOpen":false,"sqlPortOpen":false,"sshPortOpen":false
			//,"purchasedByPlayer":false,"backdoorInstalled":false,"baseDifficulty":10
			//,"hackDifficulty":10,"minDifficulty":3,"moneyAvailable":2000000
			//,"moneyMax":50000000,"numOpenPortsRequired":0,"openPortCount":0
			//,"requiredHackingSkill":1,"serverGrowth":5}
			if(ns.hasRootAccess(scan[i])){
				ns.tprint("root Access");
				ns.tprint(server["maxRam"]);
				if(server["maxRam"]=8)		{threads=3}
				else if(server["maxRam"]=16){threads=6}
				else if(server["maxRam"]=32){threads=4}
				else if(server["maxRam"]=4)	{threads=1}
				if(!ns.fileExists("weakGrowHack.js",scan[i])){
					await ns.scp("weakGrowHack.js",scan[i]);
				}
				if(!ns.scriptRunning("weakGrowHack.js",scan[i])){
					await ns.exec("weakGrowHack.js",scan[i], threads, scan[i], threads);
				}				
			}
			else if(ns.getHackingLevel()>=ns.getServerRequiredHackingLevel(scan[i])){
				//how many ports are open
				portsCount=0;
				if(!server["ftpPortOpen"] && ns.fileExists("FTPCrack.exe")){
					portsCount+=1;
					ns.ftpcrack(scan[i]);
				}
				if(!server["httpPortOpen"] && ns.fileExists("HTTPWorm.exe")){
					portsCount+=1;
					ns.httpworm(scan[i]);
				}
				if(!server["smtpPortOpen"] && ns.fileExists("relaySMTP.exe")){
					portsCount+=1;
					ns.relaysmtp(scan[i]);
				}
				if(!server["sshPortOpen"] && ns.fileExists("BruteSSH.exe")){
					portsCount+=1;
					ns.brutessh(scan[i]);
				}
				if(!server["sqlPortOpen"] && ns.fileExists("SQLInject.exe")){
					portsCount+=1;
					ns.sqlinject(scan[i]);
				}
				//can it be nuked
				if(portsCount>=ns.getServerNumPortsRequired(scan[i])){
					ns.nuke(scan[i]);
				}
			}
		}
	//}
}
