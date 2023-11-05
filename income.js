/** @param {NS} ns */

export async function main(ns) {

  while (true) {
    purchaseServer(ns);
    buyHackNode(ns);
    await ns.sleep(10);
  }

}

function buyHackNode(ns) {
  let nodeNum = ns.hacknet.numNodes();

  if (approveBudget(ns.hacknet.getPurchaseNodeCost(), ns)) {
    ns.hacknet.purchaseNode();
    nodeNum++;
  }

  for (let i = 0; i < nodeNum; i++) {

    if (approveBudget(ns.hacknet.getLevelUpgradeCost(i), ns)) {
      ns.hacknet.upgradeLevel(i, 1);
    }
    if (approveBudget(ns.hacknet.getRamUpgradeCost(i), ns)) {
      ns.hacknet.upgradeRam(i, 1);
    }
    if (approveBudget(ns.hacknet.getCoreUpgradeCost(i), ns)) {
      ns.hacknet.upgradeCore(i, 1);
    }

  }
}

function purchaseServer(ns) {
  let purchasedServers = ns.getPurchasedServers();
  let maxServers = ns.getPurchasedServerLimit();

  if (purchasedServers.length < maxServers) {
    let serverName = 'server-' + purchasedServers.length;
    ns.purchaseServer('server-' + purchasedServers.length, getRam(ns,1));
    ns.exec('addScripts.js', 'home', 1, serverName, 'home');
  }

if(purchasedServers.length > 0){
  upgradeServer(purchasedServers, ns);
}
  
}

function upgradeServer(purchasedServers, ns) {
  for (let x in purchasedServers) {
    let serverMaxRam = ns.getServerMaxRam('server-'+x);
    let ramUpgrade = getRam(ns,serverMaxRam, 'server-'+x);
    if (ramUpgrade > serverMaxRam) {
      ns.upgradePurchasedServer('server-'+x, ramUpgrade);
      ns.exec('addScripts.js', 'home', 1, 'server-' + x, 'home');
    }
  }
}

function getRam(ns, currentRam, server) {
  let ram = currentRam;
  let ramCalculating = true;
  while (ramCalculating) {

    let ramCost = 0;
    if(server){
      ramCost = ns.getPurchasedServerUpgradeCost(server,ram*2);
    }
    else{
      ramCost = ns.getPurchasedServerCost(ram * 2);
    }
    if (approveBudget(ramCost, ns)) {
      ram *= 2
    }
    else {
      ramCalculating = false;
    }
  }
  return ram;
}

function approveBudget(cost, ns) {
  let money = ns.getServerMoneyAvailable('home');

  if (cost / money <= 1) {
    return true;
  }
  else {
    return false;
  }
}