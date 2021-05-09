const regedit = require('regedit')


//Computer\HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\{PRNAME}
//regedit.deleteKey(['HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\Adobe_Discord_RPC_NodePort'], function(err) {
//    if (err) throw err;
//})
regedit.createKey(['HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\Adobe_Discord_RPC_NodePort'], function(err) {
    if (err) throw err;
})
regedit.putValue({
    'HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\Adobe_Discord_RPC_NodePort': {
        'DisplayIcon': {
            value: 'C:\\Program Files\\Adobe Discord RPC\\temp.ico',
            type: 'REG_SZ'
        },
        'DisplayName': {
            value: 'Adobe Discord RPC',
            type: 'REG_SZ'
        },
        'DisplayVersion': {
            value: 'Release 2021-05-09-pre1',
            type: 'REG_SZ'
        },
        'InstallDate': {
            value: '20210122',
            type: 'REG_SZ'
        },
        'Publisher': {
            value: 'Adobe Discord RPC Team.',
            type: 'REG_SZ'
        },
        'UninstallString': {
            value: 'Path',
            type: 'REG_SZ'
        },
        'URLInfoAbout': {
            value: 'https://adobe.discordrpc.org/',
            type: 'REG_SZ'
        },
        'HelpLink': {
            value: 'https://adobe.discordrpc.org/',
            type: 'REG_SZ'
        },
        'ModifyPath': {
            value: 'Path',
            type: 'REG_SZ'
        },
        'InstallLocation': {
            value: 'C:\\Program Files\\Adobe Discord RPC',
            type: 'REG_SZ'
        },
        'ADRPC:Core_Version': {
            value: '4.0-pre1 (2021050901)',
            type: 'REG_SZ'
        },
        'ADRPC:Monitor_Version': {
            value: '1.0-pre1 (2021050901)',
            type: 'REG_SZ'
        },
        'ADRPC:Configurator_Version': {
            value: '1.0-pre1 (2021050901)',
            type: 'REG_SZ'
        },
        'ADRPC:Controller_Version': {
            value: '1.0-pre1 (2021050901)',
            type: 'REG_SZ'
        },
        'ADRPC:StartMenuFolder': {
            value: 'true',
            type: 'REG_SZ'
        },
        'ADRPC:StartWithWindows': {
            value: 'true',
            type: 'REG_SZ'
        },
        'ADRPC:DesktopShortcut': {
            value: 'true',
            type: 'REG_SZ'
        }
    },
}, function(err) {
    if (err) throw err;
})