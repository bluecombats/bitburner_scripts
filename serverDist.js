/** @param {NS} ns **/
function delay(milliseconds){
    return new Promise(resolve => {
        setTimeout(resolve, milliseconds);
    });
}
function list_contracts(ns,servers){
	var i,contracts;
	for(i=0; i<servers.length; i++){
		contracts = ns.ls(servers[i],"cct");
		if(contracts.length > 0){
			ns.tprint(servers[i],": ",contracts);
		}
	}
}
function find_total_growth(ns,servers){
	var i,t_growth=0,server;
	ns.print(servers);
	for(i=0; i<servers.length; i++){
		server = servers[i];
		if(ns.getServer(server)["hasAdminRights"]){
			t_growth+= ns.getServer(server["serverGrowth"]);
			//t_growth+=ns.getServerGrowth(servers[i]);
		}
	}
	return t_growth
}
async function max_ram_run_weak_js(ns,server){
	var ramLeft = ns.getServer(server)["maxRam"] - ns.getServer(server)["ramUsed"];
	//var ramLeft = ns.getServerMaxRam(server) - ns.getServerUsedRam(server);
	//get max threads you can use
	var threads,j,i, filesListStats=[],highRam=0, totalDist =2+10+1;
	//hack:grow:weaken 1:10:2
	filesListStats.push({
		"fileName":"weakOnly0.js"
		,"ram": ns.getScriptRam("weakOnly0.js",server)
		,"dist":2
	});
	filesListStats.push({
		"fileName":"growOnly0.js"
		,"ram": ns.getScriptRam("growOnly0.js",server)
		,"dist":10
	});
	filesListStats.push({
		"fileName":"hackOnly0.js"
		,"ram": ns.getScriptRam("hackOnly0.js",server)
		,"dist":1
	});
	for(i=0;i<filesListStats.length;i++){
		if(filesListStats[i]["ram"]>highRam){
			highRam = filesListStats[i]["ram"]
		}
	}
	for(i=0;i<filesListStats.length;i++){		
		threads = (ramLeft/highRam)*(filesListStats[i]["dist"]/totalDist);
		if(Math.floor(threads)<1){
			threads=1;
		}
		threads = Math.floor(threads);
		ns.print("is ",filesListStats[i]["fileName"]," running on ", server,"?");
		ns.print("threads for ",filesListStats[i]["fileName"],": ",threads);
		if(!ns.scriptRunning(filesListStats[i]["fileName"], server) && threads>0){
			ns.print(server," threads ",threads," j ",j)
			await ns.exec(filesListStats[i]["fileName"], server, {"threads":threads}, server, threads);
		}
	}
	return "done"
}
function open_ports(ns,server){
	if(!ns.getServer(server)["ftpPortOpen"] && ns.fileExists("FTPCrack.exe","home")){
		ns.ftpcrack(server);
	}
	if(!ns.getServer(server)["httpPortOpen"] && ns.fileExists("HTTPWorm.exe","home")){
		ns.httpworm(server);
	}
	if(!ns.getServer(server)["smtpPortOpen"] && ns.fileExists("relaySMTP.exe","home")){
		ns.relaysmtp(server);
	}
	if(!ns.getServer(server)["sshPortOpen"] && ns.fileExists("BruteSSH.exe","home")){
		ns.brutessh(server);
	}
	if(!ns.getServer(server)["sqlPortOpen"] && ns.fileExists("SQLInject.exe","home")){
		ns.sqlinject(server);
	}
}
function nuke_server(ns,server){
	var portsCount = ns.getServer(server)["openPortCount"];
	var portsReq = ns.getServer(server)["numOpenPortsRequired"];
	if(portsCount >= portsReq){
		ns.nuke(server);
	}
}
export async function main(ns) {
	var count=0,i,j,server,total_growth,threads;
	var servers = ns.scan();
	var current_server= ns.args[0];
	var files = ["weakOnly0.js","growOnly0.js","hackOnly0.js","serverDist.js"];
	var serverDist = files[3];
	servers.push(current_server);
	ns.tprint(servers);
	//list contracts
	list_contracts(ns,servers);
	while(servers.length != count){
		await delay(1000);
		total_growth = find_total_growth(ns,servers);
		count=0;
		for(i=0; i<servers.length; i++){
			server = servers[i];
			//ns.tprint(server);
			threads=1;
			for(j=0;j<files.length;j++){
				if(files[j]!=serverDist){
					if(!ns.fileExists(files[j],server)){
						await ns.scp(files[j],server,current_server);
					}
				}
			}
			ns.print(server," admin access? ",ns.getServer(server)["hasAdminRights"]);
			if(ns.getServer(server)["hasAdminRights"]){
				count+=1;
				if(!ns.fileExists(serverDist,server,current_server)){
					await ns.scp(serverDist,server);
					await ns.exec(serverDist,server, 1, server);
				}
				ns.print("run dist files");
				await max_ram_run_weak_js(ns,server);
			}
			//else if(ns.getHackingLevel()>= ns.getServerRequiredHackingLevel(server)){
			else if(ns.getHackingLevel()>=ns.getServer(server)["requiredHackingSkill"]){
				//how many ports are open
				open_ports(ns,server);
				//can it be nuked
				nuke_server(ns,server);
			}
		}
		await delay(1000*2);
	}
}
