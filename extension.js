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
let string11 = "Apply OCR text and caption to image as nested child block: (true|false)";
let string12 = "false";

export default {
    onload: ({ extensionAPI }) => {
        checkFirstRun();
        checkForMedia();

        try { if (checkForMediaInterval > 0) clearInterval(checkForMediaInterval) } catch (e) { }
        checkForMediaInterval = setInterval(async () => {
            await checkForMedia()
        }, 1800000);
    },
    onunload: () => {
        clearInterval(checkForMediaInterval);
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
        let md = await createBlock(string9, config, 1);
        await createBlock(string10, md, 0);
        // let imageChild = await createBlock(string11, config, 2);
        // await createBlock(string12, imageChild, 0);
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
            for (var i = 0; i < blocks.length; i++) {
                if (blocks[i].string == "**Configuration:**") {
                    config = blocks[i].children;
                    configUID = blocks[i].uid;
                }
            }
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
                    let tag = await createBlock(string7, configUID, 0);
                    await createBlock(string8, tag, 0);
                }
                var mdMatched = false;
                for (var i = 0; i < config.length; i++) {
                    if (config[i].string == string9) { // find markdownToolbar in config if present
                        mdMatched = true;
                    }
                }
                if (mdMatched == false) {
                    let md = await createBlock(string9, configUID, 1);
                    await createBlock(string10, md, 0);
                }
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
            } else { // create tag config
                let tag = await createBlock(string7, configUID, 0);
                await createBlock(string8, tag, 0);
                let md = await createBlock(string9, configUID, 1);
                await createBlock(string10, md, 0);
                // let ic = await createBlock(string11, configUID, 2);
                // await createBlock(string12, ic, 0);
            }
        } else { // create config
            let config = await createBlock(string6, page[0][0].uid, 4);
            let tag = await createBlock(string7, config, 0);
            await createBlock(string8, tag, 0);
            let md = await createBlock(string9, config, 1);
            await createBlock(string10, md, 0);
            // let ic = await createBlock(string11, config, 2);
            // await createBlock(string12, ic, 0);
        }
    }
}

async function checkForMedia() {
    let mediaBlocks = window.roamAlphaAPI.data.q(
        `[:find (pull ?block [:block/uid :block/string]) :where [?block :block/string ?contents] [(clojure.string/includes? ?contents "https://res.cloudinary.com/capturerr")]]`
    );

    for (var i = 0; i < mediaBlocks.length; i++) {
        let string = mediaBlocks[i][0]['string'];
        const regex = /^!\[\]\((.+)\)/;
        const match = string.match(regex);
        var parts = match[1].split("/");
        var id = parts[7];
        if (id.substr(id.length - 4) == ".jpg") {
            // TODO: figure a way to handle other media filetypes
            // TODO: also need to handle other filetypes in C:\Users\mlave\Documents\Development\Roam Research\servers\roam-cldy\app.js
            id = id.slice(0, id.length - 4)
        }

        let response = await fetch("https://roam-cloudinary-d4b879e2b232.herokuapp.com/getImage?url="+match[1]+"");
        if (response.ok) {
            let blob = await response.blob();
            var file = new File([blob], id+".jpg");
            let roamFile = await roamAlphaAPI.file.upload({file: file, toast: {hide: true}});
            if (roamFile != null && roamFile != undefined) {
                let newString = string.replace(match[1], roamFile);
                await roamAlphaAPI.updateBlock({"block": {"uid": mediaBlocks[i][0]['uid'], "string": newString}})
                .then(fetch("https://roam-cloudinary-d4b879e2b232.herokuapp.com/deleteImage?id="+id+""));
            }
        }
    }
}

async function createBlock(string, uid, order) {
    let newUid = roamAlphaAPI.util.generateUID();
    await window.roamAlphaAPI.createBlock({ location: { "parent-uid": uid, order: order }, block: { string: string.toString(), uid: newUid } });
    return newUid;
}