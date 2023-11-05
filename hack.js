/** @param {NS} ns */
export async function main(ns) {

  let foundServers = scanAll(ns,false);

  //removes home
  foundServers.shift();

  let hackThresh = 0;
  let moneyPercent = 0;

  let bool = true;

  while (bool) {

    for (let server of foundServers) {
      if (!ns.hasRootAccess(server)) {
        continue;
      }
      hackThresh = ns.hackAnalyzeChance(server);
      moneyPercent = ns.getServerMoneyAvailable(server) / ns.getServerMaxMoney(server);

      if (moneyPercent <= .90) {
        await ns.grow(server);
      }
      else if (hackThresh > .80) {
        await ns.hack(server);
      }
      else {
        await ns.weaken(server);
      }
    }
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