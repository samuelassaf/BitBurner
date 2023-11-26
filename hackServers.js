/** @param {NS} ns */
//Scans through all servers and attempts to obtain root access. 
//For each server with root access, calls the addScripts.js to populate the server with desired scripts.
//Once the first loop of servers is complete, continually searches for new servers to obtain root access on.

export async function main(ns) {

  hackServer('home', ns);
  let foundServers = ['home'];
  while (true) {
    for (let i = 0; i < foundServers.length; i++) {
      let serverScan = ns.scan(foundServers[i]);
      for (let j = 0; j < serverScan.length; j++) {
        if (foundServers.includes(serverScan[j]) || serverScan[j].includes('server-')) {
          continue;
        }
        if (hackServer(serverScan[j], ns)) {
          foundServers.push(serverScan[j]);
        }
      }
    }
    await ns.asleep(1000);
  }

}


export function hackServer(server, ns) {
  let currentHackingLevel = ns.getHackingLevel();
  let accessSuccess = gainAccess(server, currentHackingLevel, ns);
  if (accessSuccess) {
    //ns.tprint('Executing addScripts on ' + server);
    //ns.exec('addScripts.js', 'home', 1, server, 'home');
    return true;
  }
  else {
    return false;
  }
}

function gainAccess(server, currentHackingLevel, ns) {

  //ns.tprint('Accessing ' + server);

  if (ns.hasRootAccess(server)) {
    //ns.tprint('Already have access to server: ' + server);
    return true;
  }

  let serverHackingLevel = ns.getServerRequiredHackingLevel(server);
  if (serverHackingLevel > currentHackingLevel) {
    //ns.tprint('Hacking Level Too Low. Player Level: ' + currentHackingLevel + '. Required: ' + serverHackingLevel);
    return false;
  }
  let numPortsRequired = ns.getServerNumPortsRequired(server);

  let portsOpened = openPorts(server, numPortsRequired, ns);

  if (!portsOpened) {
    //ns.tprint('Ports could not be opened');
    return false;
  }

  //ns.tprint('Access Granted');
  return true;

}

function openPorts(server, numPorts, ns) {
  switch (numPorts) {
    case 5:
      if (ns.fileExists('SQLInject.exe')) {
        ns.tprint('SQL Inject...');
        ns.sqlinject(server);
      }
      else {
        return false;
      }
    case 4:
      if (ns.fileExists('HTTPWorm.exe')) {
        ns.tprint('HTTP Worm...');
        ns.httpworm(server);
      }
      else {
        return false;
      }
    case 3:
      if (ns.fileExists('relaySMTP.exe')) {
        ns.tprint('relay SMTP...');
        ns.relaysmtp(server);
      }
      else {
        return false;
      }
    case 2:
      if (ns.fileExists('FTPCrack.exe')) {
        ns.tprint('ftp crack...');
        ns.ftpcrack(server);
      }
      else {
        return false;
      }
    case 1:
      if (ns.fileExists('bruteSSH.exe')) {
        ns.tprint('brush ssh...');
        ns.brutessh(server);
      }
      else {
        return false;
      }
    case 0:
      ns.nuke(server);
      ns.tprint('Server Nuked: ' + server);
      return true;
  }
}