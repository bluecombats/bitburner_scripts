/** @param {NS} ns **/
function delay(milliseconds){
    return new Promise(resolve => {
        setTimeout(resolve, milliseconds);
    });
}
export async function main(ns) {
	var count=0,i,j;
	var scan = ns.scan();
	var server, portsCount, portsReq, threads;
	//server = ns.getHostname()
	server = ns.getServer()["hostname"];	
	scan.push(server);
	ns.tprint(scan);
	while(scan.length != count){
		//ns.tprint("scan length: ",scan.length);
		await delay(1000);
		count=0;
		for(i=0; i<scan.length; i++){
			server = scan[i];
			//ns.tprint(server);
			threads=1;
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
			//ns.tprint("hack lvl: ",ns.getHackingLevel()
			//,"server level: ",ns.getServer(server)["requiredHackingSkill"])
			if(!ns.fileExists("weakGrowHack.js",scan[i])){
				await ns.scp("weakGrowHack.js",scan[i]);
			}
			//if(ns.hasRootAccess(server)){
			if(ns.getServer(server)["hasAdminRights"]){
			//ns.hasRootAccess(scan[i])){
				count+=1;
				if(!ns.fileExists("serverHack.js",scan[i])){
					await ns.scp("serverHack.js",scan[i]);
					await ns.exec("serverHack.js",scan[i], 1);
				}
				//then copy over hack script
				var ramLeft = ns.getServer(server)["maxRam"] - ns.getServer(server)["ramUsed"];
				//var ramLeft = ns.getServerMaxRam(server) - ns.getServerUsedRam(server);
				//get max threads you can use
				var scriptRam = ns.getScriptRam("weakGrowHack.js",server);
				for(j=Math.floor(ramLeft); j>0; j--){
					if(scriptRam*j<=ramLeft){
						threads=j;
						break;
					}
				}
				if(!ns.scriptRunning("weakGrowHack.js", scan[i])){
					await ns.exec("weakGrowHack.js", scan[i], threads, scan[i], threads);
				}
			}
			//else if(ns.getHackingLevel()>= ns.getServerRequiredHackingLevel(server)){
			else if(ns.getHackingLevel()>=ns.getServer(server)["requiredHackingSkill"]){
				//how many ports are open
				if(!ns.getServer(server)["ftpPortOpen"] && ns.fileExists("FTPCrack.exe","home")){
					ns.ftpcrack(scan[i]);
				}
				if(!ns.getServer(server)["httpPortOpen"] && ns.fileExists("HTTPWorm.exe","home")){
					ns.httpworm(scan[i]);
				}
				if(!ns.getServer(server)["smtpPortOpen"] && ns.fileExists("relaySMTP.exe","home")){
					ns.relaysmtp(scan[i]);
				}
				if(!ns.getServer(server)["sshPortOpen"] && ns.fileExists("BruteSSH.exe","home")){
					ns.brutessh(scan[i]);
				}
				if(!ns.getServer(server)["sqlPortOpen"] && ns.fileExists("SQLInject.exe","home")){
					ns.sqlinject(scan[i]);
				}
				//can it be nuked
				portsCount = ns.getServer(server)["openPortCount"];
				//if(ns.getServer(server)["numOpenPortsRequired"]="null"){portsReq=0}
				//else(
					portsReq = ns.getServer(server)["numOpenPortsRequired"]
				//)
				//ns.tprint("open ports: ",portsCount);
				//ns.tprint("req ports: ",portsReq);
				//if(portsCount >= ns.getServerNumPortsRequired(scan[i])){
				if(portsCount >= portsReq){
					ns.nuke(scan[i]);
				}
			}
		}
		//ns.tprint("servers open:",count);
	}
}
