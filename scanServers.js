/** @param {NS} ns */
export async function main(ns) {

  let server = ns.args[0];

  if (server) {
    postServerStats(ns, server);
  }
  else {
    scanAll(ns, false);
  }
}

export function scanAll(ns, includePurchasedServers) {
  let foundServers = ['home'];
  for (let i = 0; i < foundServers.length; i++) {
    let serverScan = ns.scan(foundServers[i]);
    for (let j = 0; j < serverScan.length; j++) {
      if (foundServers.includes(serverScan[j]) || (serverScan[j].includes('server-') && !includePurchasedServers)) {
        continue;
      }
      foundServers.push(serverScan[j]);
      postServerStats(ns, serverScan[j]);
    }
  }

  return foundServers;
}

function postServerStats(ns, server) {
  let availableMoney = ns.getServerMoneyAvailable(server);
  let maxMoney = ns.getServerMaxMoney(server);

  ns.tprint(
    server + ' money: ' +
    formatMoney(availableMoney) + ' / ' +
    formatMoney(maxMoney) +
    ' - ' + ((availableMoney / maxMoney)*100).toFixed(2) + '%'
  );
}

function formatMoney(money) {
  let text = Math.trunc(money).toString();
  let charCount = 0;
  let formattedText = '';

  for (let i = text.length - 1; i >= 0; i--) {
    charCount++;
    formattedText = text.substring(i, i + 1) + formattedText;
    if (charCount == 3 && i != 0) {
      formattedText = ',' + formattedText;
      charCount = 0;
    }
  }

  return formattedText;
}