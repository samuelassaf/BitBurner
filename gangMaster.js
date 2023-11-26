/** @param {NS} ns */
export async function main(ns) {

  while (true) {
    recruitMembers(ns);
    let members = getGangMembers(ns);
    for (let member of members) {
      assignTask(ns, member);
      ascendMember(ns, member);
      await ns.asleep(2000);
    }
    clash(ns);
  }
}

function assignTask(ns, member) {
  let trainTask = 'Train Combat';
  let clashTask = 'Territory Warfare';
  let gang = ns.gang.getGangInformation();

  if (!approveGangMemberLevel(member)) {
    ns.gang.setMemberTask(member.name, trainTask);
  }
  else if (!gang.approveClash) {
    ns.gang.setMemberTask(member.name, clashTask);
  }
  else if (gang.wantedPenalty <= 1) {
    ns.gang.setMemberTask(member.name, getMoneyTask(ns).name);
  }
  else {
    ns.gang.setMemberTask(member.name, getRespectTask(ns).name);
  }

}

export function getGangMembers(ns) {
  let names = ns.gang.getMemberNames();
  let members = [];
  for (let name of names) {
    members.push(ns.gang.getMemberInformation(name));
  }

  return members;
}

function ascendMember(ns, member) {

  let respectPercentage = member.earnedRespect / ns.gang.getGangInformation().respect;

  if (ns.gang.getAscensionResult(member.name)?.agi > 2 && respectPercentage <= .1) {
    ns.gang.ascendMember(member.name);
  }
}

function recruitMembers(ns) {
  if(!ns.gang.canRecruitMember()){
    return;
  }
  let recruitNum = ns.gang.getRecruitsAvailable();
  if (recruitNum > 0) {
    for (let i = 0; i < recruitNum; i++) {
      ns.gang.recruitMember((Math.random() + 1).toString(36));
    }
  }
}

function getTasks(ns) {

  let isHackingGang = ns.gang.getGangInformation().isHacking;
  let allTasks = [];
  for (let name of ns.gang.getTaskNames()) {
    let task = ns.gang.getTaskStats(name);
    if (task.isHacking != isHackingGang) {
      continue;
    }
    allTasks.push(task);
  }
  return allTasks;

}

function getMoneyTask(ns) {
  let tasks = getTasks(ns);
  tasks.sort(
    (x, y) =>
      (x.baseMoney < y.baseMoney) ? 1 : (x.baseMoney > y.baseMoney) ? -1 : 0);

  return tasks[0];
}

function getRespectTask(ns) {
  let tasks = getTasks(ns);
  tasks.sort(
    (x, y) =>
      (x.baseRespect < y.baseRespect) ? 1 : (x.baseRespect > y.baseRespect) ? -1 : 0);

  return tasks[0];
}

//Used in several scripts, such as income.js that determines when to buy equipment.
export function approveGangMemberLevel(gangMember) {

  return gangMember.agi_asc_mult >= 20;
}

function clash(ns) {
  if(approveClash(ns)){
    ns.gang.setTerritoryWarfare(true);
  }

}

function approveClash(ns) {
  let gangMap = new Map(Object.entries(ns.gang.getOtherGangInformation()));
  gangMap.delete(ns.gang.getGangInformation().faction);

  for (let key of gangMap.keys()) {

    if (ns.gang.getChanceToWinClash(key) < .99) {
      ns.gang.setTerritoryWarfare(false);
      return false;
    }
  }
  return true;
}