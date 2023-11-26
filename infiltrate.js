/** @param {NS} ns */
export async function main(ns) {

  let locations = ns.infiltration.getPossibleLocations();
  let minDifficulty = ns.args[0];
  let maxDifficulty = ns.args[1];
  let notedLocations = [];
  for (let l of locations) {
    let lInfo = ns.infiltration.getInfiltration(l.name);
    if (lInfo.difficulty >= minDifficulty && lInfo.difficulty <= maxDifficulty) {
      notedLocations.push(lInfo);
    }
  }

  notedLocations.sort(
    (x, y) =>
      (x.reward.sellCash < y.reward.sellCash) ? 1 : (x.reward.sellCash > y.reward.sellCash) ? -1 : 0);

  for (let l of notedLocations) {
    let text =
      l.difficulty.toFixed(2) + ' | ' + l.reward.tradeRep.toFixed(2) + ' | ' +
      l.location.name +' | ' + l.location.city;
    ns.tprint(text);
  }


}