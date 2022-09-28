/** @param {NS} ns */
function texttointeger(inputtxt,alphabet){
	var input=[];
	for(var i=0;i<inputtxt.length;i++){
		for(var j=0; j<alphabet.length;j++){
			if (inputtxt[i]==alphabet[j]){
				input.push(j);
			}
		}
	}
	return input;
}
export async function main(ns) {
	var contract = ns.args[0];
	var inputtxt = ns.args[1];
	var cypertxt = ns.args[2];
	var grid=[], alphabet=["A","B","C","D","E","F","G",
	"H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z",];
	for(var i=0;i<alphabet.length;i++){
		grid[i]=[];
		for(var j=0; j<alphabet.length;j++){
			grid[i][j]=(i+j) %alphabet.length;
		}
	}
	//ns.tprint(inputtxt);
	var input = texttointeger(inputtxt,alphabet);
	//ns.tprint(input);
	//ns.tprint(cypertxt);
	var cyper = texttointeger(cypertxt,alphabet);
	//ns.tprint(cyper);
	var cyperrepeat=[];
	for(i=0;i<input.length;i++){
		cyperrepeat.push(cyper[i%cyper.length]);
	}
	//ns.tprint(cyperrepeat);
	var answer=[];
	for(i=0;i<input.length;i++){
		answer.push(grid[input[i]][cyperrepeat[i]]);
	}
	//ns.tprint(answer);
	var answertxt="";
	for(i=0;i<answer.length;i++){
		answertxt += alphabet[answer[i]];
	}
	ns.tprint(answertxt);
}
