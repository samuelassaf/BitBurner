/** @param {NS} ns */
import { scanAll } from 'hack.js';
export async function main(ns) {

  let unhackedServers = hackAll(ns);

  let bool = true;

  while (bool) {

    for (let i = unhackedServers.length - 1; i >= 0; i--) {
      if (i < 0) {
        bool = false;
        break;
      }
      if (hackServer(unhackedServers[i], ns, ns.getHackingLevel())) {
        unhackedServers.splice(i, 1);
      }
    }
    await ns.grow('foodnstuff');
  }

}


function hackAll(ns) {
  let foundServers = scanAll(ns, true);

  //ns.tprint('servers: ' + foundServers);

  let currentHackingLevel = ns.getHackingLevel();

  let unhackedServers = [];

  for (let i = 0; i < foundServers.length; i++) {
    let hacked = hackServer(foundServers[i], ns, currentHackingLevel);

    //ns.tprint('Hacked Status: ' + hacked);
    if (!hacked) {
      //ns.tprint('unhacked server push ' + foundServers[i]);
      unhackedServers.push(foundServers[i]);
    }
  }

  return unhackedServers;
}


function hackServer(server, ns, currentHackingLevel) {
  let accessSuccess = gainAccess(server, currentHackingLevel, ns);
  if (accessSuccess) {
    //ns.tprint('Executing addScripts on ' + server);
    ns.exec('addScripts.js', 'home', 1, server, 'home');
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
      return false;
    case 4:
      return false;
    case 3:
      if (ns.fileExists('relaySMTP.exe')) {
        ns.tprint('relay SMTP...');
        ns.ftpcrack(server);
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