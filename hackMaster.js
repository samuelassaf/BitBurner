/** @param {NS} ns */
import { hackServer } from 'hackServers.js';
export async function main(ns) {

  let targetHackerMap = new Map();
  let hack = ns.formulas.hacking;
  let availableMoney = 0;
  let maxMoney = 0;
  let growScript = 'grow.js';
  let hackScript = 'hack.js';
  let weakenScript = 'weaken.js';
  let stockTarget = '';
  while (true) {
    let targets = scanAll(ns);
    for (let target of targets) {
      maxMoney = ns.getServerMaxMoney(target.hostname);
      if (maxMoney == 0) {
        continue;
      }

      if (!hackServer(target.hostname, ns) || (stockTarget != '' && target.hostname != stockTarget)) {
        continue;
      }

      targetHackerMap = checkRunningScript(ns, targetHackerMap, target);
      if (targetHackerMap.has(target.hostname)) {
        continue;
      }

      availableMoney = ns.getServerMoneyAvailable(target.hostname);
      if (availableMoney < maxMoney) {
        let threadsNeeded = 0;
        if (ns.fileExists('Formulas.exe')) {
          threadsNeeded = hack.growThreads(target, ns.getPlayer(), maxMoney);
        }
        else {
          threadsNeeded = 300000;
        }
        let servers = calculateThreads(ns, growScript, threadsNeeded,targets);
        if (servers.size > 0) {
          await executeScript(ns, servers, growScript, target);
        }
        targetHackerMap.set(target.hostname, Array.from(servers.keys()));
        continue;
      }

      if(target.hostname == stockTarget){
        continue;
      }

      let targetSecurityLevel = ns.getServerSecurityLevel(target.hostname);
      let hackChance = ns.hackAnalyzeChance(target.hostname);
      if (availableMoney > 0 && (hackChance > .9 || targetSecurityLevel == target.minDifficulty )) {
        let servers = calculateThreads(ns, hackScript, ns.hackAnalyzeThreads(target.hostname, availableMoney),targets);
        if (servers.size > 0) {
          await executeScript(ns, servers, hackScript, target);
          targetHackerMap.set(target.hostname, Array.from(servers.keys()));
        }
      }


      if (target.minDifficulty < targetSecurityLevel) {
        let servers = calculateWeakenThreads(ns, target, weakenScript,targets);
        if (servers.size > 0) {
          await executeScript(ns, servers, weakenScript, target);
          targetHackerMap.set(target.hostname, Array.from(servers.keys()));
        }
        continue;
      }

    }

    await ns.sleep(1000);
  }

}

function checkRunningScript(ns, targetHackerMap, target) {

  if (!targetHackerMap.has(target.hostname)) {
    return targetHackerMap;
  }

  let servers = targetHackerMap.get(target.hostname);
  let result = new Set();
  for (let server of servers) {
    let ps = ns.ps(server);
    for (let script of ps) {
      if (script.args[0] == target.hostname) {
        result.add(server);
      }
    }
  }

  if (result.size > 0) {
    targetHackerMap.set(target.hostname, result);
  }
  else {
    targetHackerMap.delete(target.hostname);
  }

  return targetHackerMap;
}

export function scanAll(ns) {
  let foundServers = ['home'];
  let serverMap = new Map();
  let servers = [];
  let server = {};
  for (let i = 0; i < foundServers.length; i++) {
    let serverScan = ns.scan(foundServers[i]);
    for (let j = 0; j < serverScan.length; j++) {
      if (foundServers.includes(serverScan[j]) || serverScan[j].includes('server-')) {
        continue;
      }
      server = ns.getServer(serverScan[j]);
      foundServers.push(serverScan[j]);
      serverMap.set(serverScan[j], server);
      servers.push(server);
    }
  }

  servers.sort(
    (x, y) =>
      (x.moneyMax < y.moneyMax) ? 1 : (x.moneyMax > y.moneyMax) ? -1 : 0
  );
  return servers;
}

function calculateThreads(ns, script, neededThreads, targets) {

  neededThreads = Math.ceil(neededThreads);
  let servers = ns.getPurchasedServers();
  for(let target of targets){
    servers.push(target.hostname);
  }
  let scriptSize = ns.getScriptRam(script);
  let threadMap = new Map();

  let threadCount = 0;

  for (let server of servers) {
    let availableRam = ns.getServerMaxRam(server) - ns.getServerUsedRam(server);
    let availableThreads = Math.floor(availableRam / scriptSize);

    if (availableThreads == 0) {
      continue;
    }

    if (availableThreads > (neededThreads - threadCount)) {
      availableThreads = Math.floor(neededThreads - threadCount);
    }

    if (availableThreads == 0) {
      continue;
    }
    threadCount += availableThreads;
    threadMap.set(server, availableThreads);

    if (threadCount == neededThreads) {
      break;
    }
  }
  return threadMap;
}

function calculateWeakenThreads(ns, target, script,targets) {

  let securityValue = ns.getServerSecurityLevel(target.hostname);
  let threadCount = 0;

  while (target.minDifficulty < securityValue) {
    securityValue -= ns.weakenAnalyze(1, 1);
    threadCount++;
  }
  return calculateThreads(ns, script, threadCount,targets);
}

async function executeScript(ns, servers, script, target) {
  for (let server of servers.keys()) {
    if (!ns.fileExists(script, server)) {
      await ns.scp(script, server, 'home');
    }
    //ns.tprint('Executing Script on: ' + server + ' | Threads: ' + servers.get(server) + ' | ' + script + ' | target: ' + target.hostname);
    ns.exec(script, server, servers.get(server), target.hostname);
  }
}
