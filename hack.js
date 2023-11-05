/** @param {NS} ns */

//When run, searches through all hackable servers and calls the grow,hack,and weaken functions.
export async function main(ns) {

  let foundServers = [];
  let hackThresh = 0;
  let moneyPercent = 0;

  while (true) {

    foundServers = scanAll(ns, false);
    
    //removes home from being hacked
    foundServers.shift();

    for (let server of foundServers) {
      if (!ns.hasRootAccess(server)) {
        continue;
      }
      hackThresh = ns.hackAnalyzeChance(server);
      maxMoney = ns.getServerMaxMoney(server);
      if (maxMoney == 0) {
        continue;
      }
      availableMoney = ns.getServerMoneyAvailable(server);
      moneyPercent = availableMoney / maxMoney;

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
      if (serverScan[j].includes('server-')) {
      }

    }
  }

  return foundServers;
}