export default {
    onload: ({ extensionAPI }) => {
        checkFirstRun();
    },
    onunload: () => {
        // nothing to see here
    }
}

async function checkFirstRun() {
    var page = await window.roamAlphaAPI.q(`[:find (pull ?page [:block/string :block/uid {:block/children ...}]) :where [?page :node/title "Quick Capture for Roam Research companion"]  ]`);
    if (page.length == 0) {  // first install, create page
        let newUid = roamAlphaAPI.util.generateUID();
        await window.roamAlphaAPI.createPage({ page: { title: "Quick Capture for Roam Research companion", uid: newUid } });
        let string1 = "Thank you for installing the companion extension for the Quick Capture for Roam Research android/iOS application.";
        let string2 = "This page has been automatically generated to allow authentication with the app.";
        await createBlock(string1, newUid, 0);
        await createBlock(string2, newUid, 1);
        await createBlock("---", newUid, 2);
        let ws_1 = "Authentication key:";
        let headerUID = await createBlock(ws_1, newUid, 3);
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