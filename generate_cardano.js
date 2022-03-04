// Simple art generator by HashLips <->

#include
"./lib/json2.js";

function main() {
    var continueConfirmation = confirm(
        "You are about to use the HashLips art generator. Are you sure you want to continue?"
    );

    if (!continueConfirmation) return;

    var supply = prompt("How many images do you want to generate?", "10");

    var name = prompt("What is the name of your collection?", "");

    var description = prompt("What is the description for your collection?", "");

    alert(
        supply +
        " images will be generated, so sit back relax and enjoy the art being generated."
    );

    var groups = app.activeDocument.layerSets;

    resetLayers(groups);

    function getRWeights(_str) {
        var weight = Number(_str.split("#").pop());
        if (isNaN(weight)) {
            weight = 1;
        }
        return weight;
    }

    function cleanName(_str) {
        return _str.split("#").shift();
    }

    for (var h = 1; h < parseInt(supply) + 1; h++) {
        var obj = {};
        obj.name = name + ('0000' + h).slice(-4);
        obj.description = description || "<description>";
        obj.mediaType = "<mime_type>";
        obj.image = "<ipfs_link>";
        obj.files = [];
        obj.files.push({"name": "<display_name>", "mediaType": "<mime_type>", "src": "<ipfs_link>"})
        for (var i = 0; i < groups.length; i++) {
            var totalWeight = 0;
            var layerMap = [];

            for (var j = 0; j < groups[i].layers.length; j++) {
                totalWeight += getRWeights(groups[i].layers[j].name);
                layerMap.push({
                    index: j,
                    name: cleanName(groups[i].layers[j].name),
                    weight: getRWeights(groups[i].layers[j].name)
                });
            }

            var ran = Math.floor(Math.random() * totalWeight);

            (function () {
                for (var j = 0; j < groups[i].layers.length; j++) {
                    ran -= layerMap[j].weight;
                    if (ran < 0) {
                        groups[i].layers[j].visible = true;
                        obj[groups[i].name] = layerMap[j].name;
                        return;
                    }
                }
            })();
        }
        saveImage(obj.name);
        saveMetadata(obj);
        resetLayers(groups);
    }
    alert("Generation process is complete.");
}

function resetLayers(_groups) {
    for (var i = 0; i < _groups.length; i++) {
        _groups[i].visible = true;
        for (var j = 0; j < _groups[i].layers.length; j++) {
            _groups[i].layers[j].visible = false;
        }
    }
}

function saveImage(_name) {
    var saveFile = new File(toFolder("build/images") + "/" + _name + ".png");
    exportOptions = new ExportOptionsSaveForWeb();
    exportOptions.format = SaveDocumentType.PNG;
    exportOptions.PNG24 = false;
    exportOptions.transparency = true;
    exportOptions.interlaced = false;
    app.activeDocument.exportDocument(
        saveFile,
        ExportType.SAVEFORWEB,
        exportOptions
    );
}

function saveMetadata(_data) {
    var file = new File(toFolder("build/metadata") + "/" + _data.name + ".metadata");
    file.open("w");
    file.write(JSON.stringify({"721": {"<policy_id>": {"<asset_name>": _data}}}, null, 4));
    file.close();
}

function toFolder(_name) {
    var path = app.activeDocument.path;
    var folder = new Folder(path + "/" + _name);
    if (!folder.exists) {
        folder.create();
    }
    return folder;
}


main();
