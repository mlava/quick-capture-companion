let string1 = "Thank you for installing the companion extension for the Capture for Roam Research Android/iOS application.";
let string2 = "This page has been automatically generated to allow authentication with the app.";
let string3 = "If you have not already installed the mobile app, you can find it at:";
let string4 = "[Google Play](https://play.google.com/store/apps/details?id=com.lavercombe.quickCaptureRoamResearch)";
let string5 = "[App Store](https://apps.apple.com/app/id6450912541?platform=iphone)";
let string6 = "**Configuration:**";
let string7 = "Tag to apply to notes:";
let string8 = "capture";
let string9 = "Show Markdown toolbar for text notes: (true|false)";
let string10 = "true";

export default {
    onload: () => {
        if (!canUseRoamAPI()) return;
        checkFirstRun().catch((err) => {
            console.warn("Capture companion: init failed", err);
        });
    },
    onunload: () => {
    }
}

function canUseRoamAPI() {
    return !!(window.roamAlphaAPI?.q && window.roamAlphaAPI?.createPage && window.roamAlphaAPI?.createBlock && window.roamAlphaAPI?.util?.generateUID);
}

async function checkFirstRun() {
    var pageUidResult = await window.roamAlphaAPI.q(`[:find ?uid :where [?page :node/title "Capture for Roam Research companion"] [?page :block/uid ?uid]]`);
    if (pageUidResult.length == 0) {  // first install, create page
        let newUid = window.roamAlphaAPI.util.generateUID();
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
        let md = await createBlock(string9, config, 1);
        await createBlock(string10, md, 0);
        // let imageChild = await createBlock(string11, config, 2);
        // await createBlock(string12, imageChild, 0);
        await createBlock("---", newUid, 5);
        let ws_1 = "Authentication key:";
        let headerUID = await createBlock(ws_1, newUid, 6);
        let uuid = self.crypto?.randomUUID ? self.crypto.randomUUID() : window.roamAlphaAPI.util.generateUID();
        await createBlock(uuid, headerUID, 1);

        if (window.roamAlphaAPI?.ui?.mainWindow?.openPage) {
            await window.roamAlphaAPI.ui.mainWindow.openPage({ page: { uid: newUid } });
        }
    } else { // page exists, make sure it's up-to-date with config options
        let pageUid = pageUidResult[0][0];
        let configResult = await window.roamAlphaAPI.q(`[:find (pull ?config [:block/uid {:block/children [:block/uid :block/string]}]) :where [?page :block/uid "${pageUid}"] [?page :block/children ?config] [?config :block/string "**Configuration:**"]]`);
        var config, configUID = undefined;
        if (configResult.length > 0 && configResult[0][0]) {
            config = configResult[0][0].children;
            configUID = configResult[0][0].uid;
        }

        if (configUID != undefined) {
            if (config != undefined && config.length > 0) { // check config for re-ordering and find config to update if not present
                var tagMatched = false;
                for (var i = 0; i < config.length; i++) {
                    if (config[i].string == string7) { // find tag in config if present
                        tagMatched = true;
                    }
                }
                if (tagMatched == false) {
                    let insertOrder = config.length;
                    let tag = await createBlock(string7, configUID, insertOrder);
                    await createBlock(string8, tag, 0);
                    config = config.concat([{ string: string7 }]);
                }
                var mdMatched = false;
                for (var i = 0; i < config.length; i++) {
                    if (config[i].string == string9) { // find markdownToolbar in config if present
                        mdMatched = true;
                    }
                }
                if (mdMatched == false) {
                    let insertOrder = config.length;
                    let md = await createBlock(string9, configUID, insertOrder);
                    await createBlock(string10, md, 0);
                    config = config.concat([{ string: string9 }]);
                }
                /*
                var imageChildMatched = false;
                for (var i = 0; i < config.length; i++) {
                    if (config[i].string == string11) { // find markdownToolbar in config if present
                        imageChildMatched = true;
                    }
                }
                if (imageChildMatched == false) {
                    // let ic = await createBlock(string11, configUID, 2);
                    // await createBlock(string12, ic, 0);
                }
                */
            } else { // create tag config
                let tag = await createBlock(string7, configUID, 0);
                await createBlock(string8, tag, 0);
                let md = await createBlock(string9, configUID, 1);
                await createBlock(string10, md, 0);
                // let ic = await createBlock(string11, configUID, 2);
                // await createBlock(string12, ic, 0);
            }
        } else { // create config
            let pageChildrenCount = await window.roamAlphaAPI.q(`[:find (count ?c) :where [?p :block/uid "${pageUid}"] [?p :block/children ?c]]`);
            let insertOrder = pageChildrenCount[0]?.[0] || 0;
            let config = await createBlock(string6, pageUid, insertOrder);
            let tag = await createBlock(string7, config, 0);
            await createBlock(string8, tag, 0);
            let md = await createBlock(string9, config, 1);
            await createBlock(string10, md, 0);
            // let ic = await createBlock(string11, config, 2);
            // await createBlock(string12, ic, 0);
        }
    }
}

async function createBlock(string, uid, order) {
    let newUid = window.roamAlphaAPI.util.generateUID();
    await window.roamAlphaAPI.createBlock({ location: { "parent-uid": uid, order: order }, block: { string: string.toString(), uid: newUid } });
    return newUid;
}
