/** @param {NS} ns */
function delay(milliseconds) {
	return new Promise(resolve => {
		setTimeout(resolve, milliseconds);
	});
}
export async function main(ns) {
	let fragments, frag, active_frag,i;
	const frag_def = ns.stanek.fragmentDefinitions();
	ns.print(frag_def);
	while (true){
		//charge fragments
		fragments = ns.stanek.activeFragments();
		for (frag of fragments) { 
			ns.print("frag:",frag);
			for(i=0; i<=frag_def.length; i++){
				if(frag_def[i]["id"]==frag["id"]){
					active_frag = frag_def[i];
					break;
				}
			}
			ns.print("active_frag:",active_frag);
			//skip fragments that are boosters i.e. type 18
			if(active_frag["type"]!=18){
				await ns.stanek.chargeFragment(frag.x, frag.y);
			}
		}
		await delay(1000 * 10);
	}
}
