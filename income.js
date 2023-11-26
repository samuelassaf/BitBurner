/** @param {NS} ns */
//Automatically purchases/upgrades hacknodes and servers.
import {getGangMembers, approveGangMemberLevel } from './gangMaster.js';
export async function main(ns) {

  let moneyThreshold = ns.getServerMoneyAvailable('home');

  while (true) {
    buyHackNode(ns, moneyThreshold);
    purchaseServer(ns, moneyThreshold);
    purchaseGangUpgrades(ns, moneyThreshold);
    await ns.sleep(10);
    let currentMoney = ns.getServerMoneyAvailable('home');
    if (currentMoney > moneyThreshold) {
      moneyThreshold = currentMoney;
    }
  }
}

function buyHackNode(ns, moneyThreshold) {

  if (ns.hacknet.numNodes() < 20 && approveBudget(ns.hacknet.getPurchaseNodeCost(), ns, moneyThreshold)) {
    ns.hacknet.purchaseNode();
  }

  for (let i = 0; i < ns.hacknet.numNodes(); i++) {
    let node = ns.hacknet.getNodeStats(i);
    if (approveNodeLevelUpgrade(ns, node, ns.hacknet.getLevelUpgradeCost(i), moneyThreshold)) {
      ns.hacknet.upgradeLevel(i, 1);
    }
    if (approveNodeRamUpgrade(ns, node, ns.hacknet.getRamUpgradeCost(i), moneyThreshold)) {
      ns.hacknet.upgradeRam(i, 1);
    }
    if (approveNodeCoreUpgrade(ns, node, ns.hacknet.getCoreUpgradeCost(i), moneyThreshold)) {
      ns.hacknet.upgradeCore(i, 1);
    }
  }
}

function purchaseServer(ns, moneyThreshold) {
  let purchasedServers = ns.getPurchasedServers();
  let maxServers = ns.getPurchasedServerLimit();

  if (purchasedServers.length < maxServers) {
    let serverName = 'server-' + purchasedServers.length;
    if (ns.purchaseServer(serverName, getRam(ns, 8)).length > 0) {
      //addScripts(ns, serverName);
    }
  }

  if (purchasedServers.length > 0) {
    upgradeServer(purchasedServers, ns, moneyThreshold);
  }

}

function upgradeServer(purchasedServers, ns, moneyThreshold) {
  for (let x in purchasedServers) {
    let serverName = 'server-' + x;
    let serverMaxRam = ns.getServerMaxRam(serverName);
    let ramUpgrade = getRam(ns, serverMaxRam, serverName, moneyThreshold);
    if (ramUpgrade > serverMaxRam) {
      if (ns.upgradePurchasedServer(serverName, ramUpgrade));
      //addScripts(ns, serverName);
    }
  }
}

function getRam(ns, currentRam, server, moneyThreshold) {
  let ram = currentRam;
  let ramCalculating = true;
  while (ramCalculating) {

    let ramCost = 0;
    if (server) {
      ramCost = ns.getPurchasedServerUpgradeCost(server, ram * 2);
    }
    else {
      ramCost = ns.getPurchasedServerCost(ram * 2);
    }
    if (approveBudget(ramCost, ns, moneyThreshold)) {
      ram *= 2
    }
    else {
      ramCalculating = false;
    }
  }
  return ram;
}

function addScripts(ns, serverName) {
  ns.exec('addScripts.js', 'home', 1, serverName, 'home');
}

function approveBudget(cost, ns, moneyThreshold, approvalPercent) {
  let currentMoney = ns.getServerMoneyAvailable('home');
  let money = 0;

  if (currentMoney < moneyThreshold) {
    money = currentMoney;
  }
  else {
    money = moneyThreshold;
  }
  let costPercentage = cost / money;

  //Approves budget if cost is less than percentage of money (1 being 100%)
  if (costPercentage <= approvalPercent ?? .1) {
    return true;
  }
  else {
    return false;
  }
}

function approveNodeUpgradeBudget(seconds, ns) {
  //Approve budget if node upgrade cost will take less than 216,000 seconds (1 hour) to turn a profit.
  if (seconds <= (3600)) {
    return true;
  }
  else {
    return false;
  }
}

function approveNodeLevelUpgrade(ns, node, cost, moneyThreshold) {
  let profitPerSecond = ((1 * 1.5) * Math.pow(1.035, node.ram - 1) * ((node.cores + 5) / 6)) * ns.getHacknetMultipliers().production;
  let secondsToProfit = cost / profitPerSecond;
  return approveNodeUpgradeBudget(secondsToProfit, ns);
}

function approveNodeRamUpgrade(ns, node, cost, moneyThreshold) {
  let profitPerSecond = ((node.level * 1.5) * (Math.pow(1.035, (2 * node.ram) - 1) - Math.pow(1.035, node.ram - 1)) * ((node.cores + 5) / 6)) * ns.getHacknetMultipliers().production;
  let secondsToProfit = cost / profitPerSecond;
  return approveNodeUpgradeBudget(secondsToProfit, ns);
}

function approveNodeCoreUpgrade(ns, node, cost, moneyThreshold) {
  let profitPerSecond = (node.level * 1.5) * Math.pow(1.035, node.ram - 1) * (1 / 6) * ns.getHacknetMultipliers().production;
  let secondsToProfit = cost / profitPerSecond;
  return approveNodeUpgradeBudget(secondsToProfit, ns);
}

function purchaseGangUpgrades(ns,moneyThreshold) {
  let isHackingGang = ns.gang.getGangInformation.isHacking;
  let members = getGangMembers(ns);
  let upgradeNames = ns.gang.getEquipmentNames();

  for (let upgradeName of upgradeNames) {
    let upgrade = ns.gang.getEquipmentStats(upgradeName);
    let upgradeCost = ns.gang.getEquipmentCost(upgradeName);
    //check if budget is in reach or if upgrade stats don't help the gang. Example, combat gangs shouldn't buy hacking upgrades.
    if (!approveBudget(upgradeCost,ns,moneyThreshold, .05) || (upgrade.hack > 0 && isHackingGang == false) || (upgrade.hack == 0 && isHackingGang == true)){
      continue;
    }

    //Check if gang members don't own the upgrade and the cost is justified in the budget.
    for(let member of members){
      if(approveGangMemberLevel(member) && !member.upgrades.includes(upgradeName)){
        ns.gang.purchaseEquipment(member.name,upgradeName);
      }
    }
  }
}

