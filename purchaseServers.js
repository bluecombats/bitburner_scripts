/** @param {NS} ns */
function delay(milliseconds){
    return new Promise(resolve => {
        setTimeout(resolve, milliseconds);
    });
}
function Moneyformat(money){
    var moneySplit;
    if(Math.abs(money/Math.pow(10,12)) >1){
        moneySplit = money/Math.pow(10,12);
        return "$"+String(moneySplit).substr(0,7)+"tr";
    }
    else if(Math.abs(money/Math.pow(10,9)) >1){
        moneySplit = money/Math.pow(10,9);
        return "$"+String(moneySplit).substr(0,7)+"bn";
    }else if(Math.abs(money/Math.pow(10,6)) >1){
        moneySplit = money/Math.pow(10,6);
        return "$"+String(moneySplit).substr(0,7)+"m";
    }else if(Math.abs(money/Math.pow(10,3)) >1){
        moneySplit = money/Math.pow(10,3);
        return "$"+String(moneySplit).substr(0,7)+"k";
    }
    else{
        return "$"+String(money);
    }
}
export async function main(ns) {
	var maxRam = 20;
	var count = 0;
	var i,j, pservers,server;
	while(ns.getPurchasedServerLimit()>count){
		count = 0;
		pservers = ns.getPurchasedServers();
		ns.print(pservers);
		ns.print("purchase servers limit: ", ns.getPurchasedServerLimit());
		if(ns.getPurchasedServerLimit()>pservers.length){
			//purchase server
			for (i=maxRam; i>=1; i--){
				ns.print("ram power:",i," cost:",Moneyformat(ns.getPurchasedServerCost(Math.pow(2,i))))
				if(ns.getPurchasedServerCost(Math.pow(2,i)) < ns.getServerMoneyAvailable("home")){
					ns.purchaseServer("pserver", Math.pow(2,i));
					break;
				}
			}
		}
		for(i=0; i<=pservers.length-1; i++){
			//can the server be upgraded
			server = pservers[i];
			//ns.tprint(server);
			//ns.tprint(server, " max ram: ",ns.getServerMaxRam(server));
			if(ns.getServerMaxRam(server)==Math.pow(2,maxRam)){
				count+=1;
			}else if(ns.getServerMaxRam(server)<Math.pow(2,maxRam)){
				//comvert max ram into power of 2 then for loop
				var ram = Math.log(ns.getServerMaxRam(server))/Math.log(2);
				ns.print(server," current ram:", ram);
				//loop between max ram and current ram
				for (j=maxRam; j>=ram; j--){
					ns.print("ram power:",j," cost:",Moneyformat(ns.getPurchasedServerCost(Math.pow(2,j))))
					if(ns.getPurchasedServerCost(Math.pow(2,j)) < ns.getServerMoneyAvailable("home")){
						ns.deleteServer(server);
						ns.purchaseServer("pserver", Math.pow(2,j));
						break;
					}
				}
			}
		}
	}
}