/** @param {NS} ns */
export async function main(ns) {

  let server = ns.args[0];

  if(server){
    postServerStats(ns, server);
  }
  else{
    scanAll(ns);
  }
}

export function scanAll(ns, includeServers) {
  let foundServers = ['home'];
  for (let i = 0; i < foundServers.length; i++) {
    let serverScan = ns.scan(foundServers[i]);
    for (let j = 0; j < serverScan.length; j++) {
      if (foundServers.includes(serverScan[j]) || (serverScan[j].includes('server-') && !includeServers)) {
        continue;
      }
      foundServers.push(serverScan[j]);
      if(serverScan[j].includes('server-')){
              postServerStats(ns,serverScan[j]);
      }

    }
  }

  return foundServers;
}

function postServerStats(ns,server){
  ns.tprint(server + ' has: ' + formatMoney(ns.getServerMoneyAvailable(server)));
  ns.tprint(server + ' max money is: ' + formatMoney(ns.getServerMaxMoney(server)));
}

function formatMoney(money){
  let text = Math.trunc(money).toString();
  let charCount = 0;
  let formattedText = '';

  for(let i = text.length-1;i >= 0; i--){
    charCount++;
    formattedText = text.substring(i,i+1) + formattedText;
    if(charCount == 3 && i != 0){
      formattedText = ',' + formattedText;
      charCount = 0;
    }
  }

  return formattedText;
}