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
        let string1 = "Thank you for installing the companion extension for the Capture for Roam Research android/iOS application.";
        let string2 = "This page has been automatically generated to allow authentication with the app.";
        let string3 = "If you have not already installed the mobile app, you can find it at:";
        let string4 = "[Google Play](https://play.google.com/store/apps/details?id=com.lavercombe.quickCaptureRoamResearch)";
        let string5 = "App Store - in review";
        await createBlock(string1, newUid, 0);
        await createBlock(string2, newUid, 1);
        let stores = await createBlock(string3, newUid, 2);
        await createBlock(string4, stores, 0);
        await createBlock(string5, stores, 1);
        await createBlock("---", newUid, 3);
        let ws_1 = "Authentication key:";
        let headerUID = await createBlock(ws_1, newUid, 4);
        let uuid = self.crypto.randomUUID();
        await createBlock(uuid, headerUID, 1);
        
        await window.roamAlphaAPI.ui.mainWindow.openPage({ page: { uid: newUid } });
    }
}

async function createBlock(string, uid, order) {
    let newUid = roamAlphaAPI.util.generateUID();
    await window.roamAlphaAPI.createBlock(
        {
            location: { "parent-uid": uid, order: order },
            block: { string: string.toString(), uid: newUid }
        });
    return newUid;
}