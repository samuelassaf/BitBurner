/** @param {NS} ns */
export async function main(ns) {

  let context = {};
  context.destination = ns.args[0];
  context.source = ns.args[1];
  context.scripts = [];
  context.totalScriptRam = 0;
  context.totalAvailableThreads = 0;
  context.files = ["hack.js", "grow.js", "weaken.js"];
  
  setScriptObjects(context, ns);
  killScripts(ns, context);
  //ns.tprint('Adding Script on: ' + context.destination);
  await ns.scp(context.files, context.destination, 'home');

  //ns.tprint('Destination: ' + context.destination);
  /*ns.tprint('server max ram for ' + context.destination + ': ' + ns.getServerMaxRam(context.destination));
  ns.tprint('server used ram for ' + context.destination + ': ' + ns.getServerUsedRam(context.destination));

  ns.tprint('Available RAM for ' + context.destination + ': ' + context.availableRam);
  ns.tprint('total Script RAM: ' + context.totalScriptRam);
*/
  //calculateThreads(context, ns);

  if (context.totalAvailableThreads == 0) {
    //ns.tprint('no threads for' + context.destination);
    //return;
  }

  //executeScripts(context, ns);
}

function setScriptObjects(context, ns) {

  let fileSize = 0;

  for (let i = 0; i < context.files.length; i++) {
    fileSize = ns.getScriptRam(context.files[i]);
    context.totalScriptRam += fileSize;
    //ns.tprint('Ram size for ' + context.files[i] + ': ' + fileSize);
    let script = {};
    script.fileName = context.files[i];
    script.fileSize = fileSize;
    script.threadCount = 0;
    context.scripts.push(script);

    //ns.tprint('Scripts on ' + context.destination + ': ' + context.scripts[i].fileName);
  }

}

function calculateThreads(context, ns) {

  let ramAvailable = true;

  let availableRam = ns.getServerMaxRam(context.destination) - ns.getServerUsedRam(context.destination);

  if(context.destination == 'home'){
    availableRam *= .9;
  }

  if (context.destination.includes('server-')) {
    //ns.tprint('Purchased Server Ram: ' + context.destination + '...' + availableRam);
  }


  while (ramAvailable) {

    for (let i = 0; i < context.scripts.length; i++) {

      if ((Math.floor(availableRam / context.scripts[i].fileSize)) > 0) {
        context.scripts[i].threadCount++;
        context.totalAvailableThreads++;
        availableRam = availableRam - context.scripts[i].fileSize;
      }
      else {
        ramAvailable = false;
      }

    }

  }

  if (context.destination.includes('server-')) {
    //ns.tprint('Remaining Ram For ' + context.destination + ': ' + availableRam);
    //ns.tprint('Total Threads Calculated For ' + context.destination + ': ' + context.totalAvailableThreads);
  }

  return context;
}

async function executeScripts(context, ns) {

  for (let i = 0; i < context.scripts.length; i++) {

    //ns.tprint('Threads started for ' + context.scripts[i].fileName + ': ' + context.scripts[i].threadCount);
    if (context.scripts[i].threadCount > 0) {


        //ns.tprint('Executing Script for: ' + context.destination);
        //ns.tprint('Script: ' + context.scripts[i].fileName);
        //ns.tprint('Script threads: ' + context.scripts[i].threadCount);
        ns.exec(
        context.scripts[i].fileName,
        context.destination,
        context.scripts[i].threadCount
      )
      //ns.tprint('Script executed: ' + context.scripts[i].fileName);
    }

  }
}

function killScripts(ns, context) {

  let runningScripts = ns.ps(context.destination);

  if (runningScripts.length == 0) {
    //ns.tprint('No scripts to kill on ' + context.destination);
    return;
  }

  for (let i = 0; i < runningScripts.length; i++) {
    //ns.tprint('Running Script on ' + context.destination + ': ' + runningScripts[i].filename);
    //ns.tprint(context.scripts);
    if (context.files.includes(runningScripts[i].filename)) {

     //ns.tprint('killing script on ' + context.destination + '...' + runningScripts[i].filename);
      ns.kill(runningScripts[i].pid);
    }
  }
}