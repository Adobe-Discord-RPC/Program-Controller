const version = "1.0-pre1";
const release_date = "2021-05-09";

// nodejs module
const fs = require('fs');
const open = require('open');
const path = require('path');
const wait = require('waait');
const si = require('systeminformation');
const socketCL = require('socket.io-client');
const child_process = require('child_process');

// custom module
const storage = require('./lib/localStorage');
const logger = require('./lib/logger');
const regedit = require('./lib/reg');

// variables
let regList, str, args_folder; // 전역변수
let config, L, SL; // 전역변수 처리. await 처리때문에 정의 부분을 init()으로 넘겼음

// 공통호출
const exit = async (exitCode=0) => {
    await L.info(`Controller exit with Code ${exitCode}.\n`);
    process.exit(exitCode);
}

const isEmpty = obj => {
    for (let key in obj) if (obj.hasOwnProperty(key)) return false;
    return true;
}

const formatBytes = (bytes, decimals=2) => {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/* Arguments 따라 호출되는 함수 S */
const help_msg = async () => {
    await L.info('[Controller Args]');
    await wait(3);
    await L.info('--help');
    await L.info('--infGet');
    await L.info('--sysGet');
    await L.info('--regGet');
    await L.info('--OpenWin-HP');
    await L.info('--OpenWin-Official');
    await L.info('--Monitor');
    await L.info('--Monitor-Kill');
    await L.info('--Monitor-UpdateAlert');
    await L.info('--Core');
    await L.info('--Configurator');
    await L.info('--Configurator-Setup');
    await L.info('--Configurator-Update');
    await L.info('--Configurator-Delete');
    await wait(3);
    await L.log('');
    await exit();
}

const getInf = async args =>{
    await L.info('[Controller INFO]');
    await wait(3);
    await L.info(`Release : v${version} (${release_date})`);
    await L.info(`Runtime : ${process.version}`);
    await L.info(`Mode : ${config.mode}`);
    await L.info(`Arguments : ${args.length} => [${args}]`);
    await wait(3);
    await L.log('');
    await exit();
}

const getSYS = async () => {
    await L.log('Getting System info...');
    let info = await si.get({
        system: 'manufacturer, model, virtual',
        cpu: 'manufacturer, brand, speed, cores, physicalCores',
        mem: 'total, used',
        osInfo: 'distro, release, arch'
    });
    await SL.info('[System INFO]');
    await wait(3);
    await SL.info(`OS : ${info.osInfo.distro} ${info.osInfo.arch} (Release ${info.osInfo.release})`);
    await SL.info(`Cpu : ${info.cpu.manufacturer} ${info.cpu.brand} @ ${info.cpu.speed}GHz (${info.cpu.physicalCores} Core, ${info.cpu.cores} Thread)`);
    await SL.info(`Memory : ${formatBytes(info.mem.total, 1)} (${formatBytes(info.mem.used, 1)} used)`);
    await SL.info(`M/B : ${info.system.manufacturer} ${info.system.model} (isVirtual : ${info.system.virtual})`);
    await wait(3);
    await SL.info('/* End of System Info. */\n');
    await L.log('System info wrote.');
    await exit();
}

const getRegs = async () => {
    await L.info(JSON.stringify(regList));
    await exit();
}

const openWin = async url => {
    await open(url, {wait: true});
    await exit();
}

const runProgram = async (run_path, argsFilename, option='') => { // run_path : 프로그램 경로 + 파일명 || argsFilename : 파일명 || option : argument
    // https://www.npmjs.com/package/sudo-prompt

    let execDir = path.join(regList.InstallLocation.value, run_path);

    // args folder Check.
    args_folder = path.join(regList.InstallLocation.value, 'run_args');
    if (! await fs.existsSync(args_folder)) { // 존재! 안할! 경우!
        await fs.mkdirSync(args_folder);
    }

    if (await fs.existsSync(path.join(args_folder, argsFilename))) {
        try {
            await fs.unlinkSync(path.join(args_folder, argsFilename));
        } catch (err) {
            await L.error(`Failed to unlink file ${argsFilename} : ${err.toString()}`);
            await exit(1);
        }
    }

    try {
        await fs.writeFileSync(path.join(args_folder, argsFilename), JSON.stringify({option}));
    } catch (err) {
        await L.error(`Failed to create file ${argsFilename} : ${err.toString()}`);
        await exit(1);
    }

    spawned_process = child_process.exec(`cmd /c chcp 65001>nul && "${execDir}"`, {env: {...process.env}}, async (err, stdout, stderr) => {
        if (err) await L.error(`An Error occurred while spawning app : ${err.toString()}`);
        if (stderr) await L.error(`app thrown an Error : ${stderr.toString()}`);
    });

    await wait(5000);
    await exit();
}

const socketSend = async (url, message) => {
    let Client = socketCL.io(url);
    Client.on('connect_error', async () => {
        await L.info('CONN_ERR');
        await exit(1);
    });
    Client.on('connect', async () => {
        Client.send({message});
        await exit();
    });
}
/* Arguments 따라 호출되는 함수 E */

// Init
const init = async () => {
    regList = await regedit.list('HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\Adobe_Discord_RPC_NodePort');
    str = new storage(regList.InstallLocation.value);

    config = await str.get('Settings');
    L = new logger(regList.InstallLocation.value, `Controller(${process.pid})`, config);
    SL = new logger(regList.InstallLocation.value, `sysInf(${process.pid})`, config);

    // Logger Init
    let res = await L.init();
    if (!res) process.exit(1);

    // Check
    if (isEmpty(config)) {
        await L.error('Config is empty!');
        await exit(1);
    }
    if (config.mode !== "Dev" && config.mode !== "Pub") {await L.error("Unknown setting value : mode."); await exit(1);}
    let args = process.argv.slice(2);

    if (args.length === 1) {

        switch (args[0]) {
            case "--help": // 가능한 args 출력
                await help_msg();
                break;
            case "--infGet": // 프로그램 Inf 출력
                await getInf(args);
                break;
            case "--sysGet": // 시스템 정보 로그
                await getSYS();
                break;
            case "--regGet": // 레지스트리 목록 출력
                await getRegs();
                break;
            case "--OpenWin-HP":
                await openWin("https://adobe.discordrpc.org/");
                break;
            case "--OpenWin-Official":
                await openWin("https://discord.gg/7MBYbERafX");
                break;
            case "--Monitor":
                await runProgram("./monitor/ADPRC_Monitor.exe", "Monitor.json");
                break;
            case "--Monitor-Kill":
                await socketSend(`ws://localhost:${config.ws.External}`, 'exit');
                break;
            case "--Monitor-UpdateAlert":
                await runProgram("./monitor/ADPRC_Monitor.exe", "Monitor.json", "forceUpdateAlert");
                break;
            case "--Core":
                await runProgram("./monitor/ADPRC_Monitor.exe", "Monitor.json", "Core");
                break;
            case "--Configurator":
                await runProgram("./configurator/ADRPC_Configurator.exe", "Configurator.json");
                break;
            case "--Configurator-Setup":
                await runProgram("./configurator/ADRPC_Configurator.exe", "Configurator.json", "Setup");
                break;
            case "--Configurator-Update":
                await runProgram("./configurator/ADRPC_Configurator.exe", "Configurator.json", "Update");
                break;
            case "--Configurator-Delete":
                await runProgram("./configurator/ADRPC_Configurator.exe", "Configurator.json", "Delete");
                break;
            default:
                await L.error('An unknown argument.');
                await exit(1);
                break;
        }

    } else {
        await L.error('The length of the arguments is too short(or too long).');
        await exit(1);
    }
}

init();