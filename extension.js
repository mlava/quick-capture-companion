let string1 = "Thank you for installing the companion extension for the Capture for Roam Research Android/iOS application.";
let string2 = "This page has been automatically generated to allow authentication with the app.";
let string3 = "If you have not already installed the mobile app, you can find it at:";
let string4 = "[Google Play](https://play.google.com/store/apps/details?id=com.lavercombe.quickCaptureRoamResearch)";
let string5 = "[App Store](https://apps.apple.com/app/id6450912541?platform=iphone)";
let string6 = "**Configuration:**";
let string7 = "Tag to apply to notes:";
let string8 = "capture";

export default {
    onload: ({ extensionAPI }) => {
        checkFirstRun();
    },
    onunload: () => {
        // nothing to see here
    }
}

async function checkFirstRun() {
    var page = await window.roamAlphaAPI.q(`[:find (pull ?page [:block/string :block/uid {:block/children ...}]) :where [?page :node/title "Capture for Roam Research companion"]  ]`);
    if (page.length == 0) {  // first install, create page
        let newUid = roamAlphaAPI.util.generateUID();
        await window.roamAlphaAPI.createPage({ page: { title: "Capture for Roam Research companion", uid: newUid } });
        await createBlock(string1, newUid, 0);
        await createBlock(string2, newUid, 1);
        let stores = await createBlock(string3, newUid, 2);
        await createBlock(string4, stores, 0);
        await createBlock(string5, stores, 1);
        await createBlock("", newUid, 3);
        let config = await createBlock(string6, newUid, 4);
        let tag = await createBlock(string7, config, 0);
        await createBlock(string8, tag, 0);
        await createBlock("---", newUid, 5);
        let ws_1 = "Authentication key:";
        let headerUID = await createBlock(ws_1, newUid, 6);
        let uuid = self.crypto.randomUUID();
        await createBlock(uuid, headerUID, 1);
        
        await window.roamAlphaAPI.ui.mainWindow.openPage({ page: { uid: newUid } });
    } else { // page exists, make sure it's up-to-date with config options
        let blocks = page[0][0].children;
        var config, configUID = undefined;
        if (blocks.length > 0) {
            for (var i=0; i < blocks.length; i++) {
                if (blocks[i].string == "**Configuration:**") {
                    config = blocks[i].children;
                    configUID = blocks[i].uid;
                    console.info(config, configUID);
                }
            }
        }
        
        if (configUID != undefined) {
            if (config != undefined && config.length > 0) { // check config for re-ordering and find config to update if not present
                var matched = false;
                for (var i = 0; i < config.length; i++) {
                    if (config[i].string == string7) { // find tag in config if present
                        matched = true;
                    }
                }
                if (matched == false) {
                    let tag = await createBlock(string7, configUID, 0);
                    await createBlock(string8, tag, 0);
                }
            } else { // create tag config
                let tag = await createBlock(string7, configUID, 0);
                await createBlock(string8, tag, 0);
            }
        } else { // create config
            let config = await createBlock(string6, page[0][0].uid, 4);
            let tag = await createBlock(string7, config, 0);
            await createBlock(string8, tag, 0);
        }
    }
}

async function createBlock(string, uid, order) {
    let newUid = roamAlphaAPI.util.generateUID();
    await window.roamAlphaAPI.createBlock({ location: {"parent-uid": uid, order: order }, block: {string: string.toString(), uid: newUid} });
    return newUid;
}