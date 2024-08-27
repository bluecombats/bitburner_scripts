/** @param {NS} ns */
function delay(milliseconds){
	return new Promise(resolve => {
			setTimeout(resolve, milliseconds);
	});
}
export async function main(ns) {
	var programs =[
		"AutoLink.exe",
		"DeepscanV1.exe",
		"ServerProfile.exe",
		"FTPCrack.exe",
		"relaySMTP.exe",
		"DeepscanV2.exe",
		"HTTPWorm.exe",
		"SQLInject.exe"
	];
	var files = ns.ls("home",".exe");
	var count=0;
	while(count!=programs.length){
		count=0;
		for(var i in programs){
			ns.print(programs[i]);
			ns.print(files);
			if(files.indexOf(programs[i])>=0){
				ns.print(`${programs[i]} is already bought`);
				count+=1;
			}
			else if(!ns.singularity.isBusy() && !ns.singularity.isFocused()){
				ns.singularity.createProgram(programs[i]);
			}
			files= ns.ls("home",".exe");
		}
		await delay(1000*1)
	}
}
