/** @param {NS} ns */
export async function main(ns) {

  let files = ["gangMaster.js", "stockmaster.js", "hackMaster.js", "hackServers.js"];

  for (let file of files) {
    ns.exec(file,'home',1);
  }

}