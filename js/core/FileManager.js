class FileManager {
    constructor(TM) {
        this.testManager = TM;
        this.testPath = null;
    }

    createTestFolder(folderName) {
        // Create necessary test folders !
        if (!fs.existsSync(folderName)) {
            fs.mkdirSync(folderName);
            if (['darwin', 'linux'].includes(process.platform)) fs.mkdirSync(folderName + '/scorm');    // for MAC
            else fs.mkdirSync(folderName + '\\scorm');                                 // for windows
            process.chdir("../");
        }
        this.setTestPath(folderName);
    }


    openTestFolder(folderName) {
        // TODO: Open Test
        console.log("Openning test : " + folderName);
        if (fs.existsSync(folderName + '/manifest.json')) {
            let testData = this.readFile(folderName + '/manifest.json');
            if (testData != null) {
                this.setTestPath(folderName);
                console.log("Test opened & loaded !");
                return testData;
            }
            return null;

        } else {
            console.log("Test not found !");
            return null;
        }
    }

    readFile(path) {
        try {
            // Chargement du cours à partir d'un fichier JSON
            const fileContent = fs.readFileSync(path, 'utf8');
            let jsonFile = JSON.parse(fileContent);

            if (jsonFile.hasOwnProperty('parameters') && jsonFile.hasOwnProperty('questions')) {
                return jsonFile;
            } else {
                // Afficher un message d'erreur: ( Format du fichier non adequate )
                console.log("Fichier manifest: Format incorrect !");
                return null;
            }
        } catch (err) {
            alert("Erreur lors de la lecture ou du parsing du fichier :" + err);
            console.error("Erreur lors de la lecture ou du parsing du fichier :", err);
            return null;
        }
    }

    setTestPath(path) {
        this.testPath = path;
        if (this.testPath != null) this.regularSave();
    }

    regularSave() {
        this.timeOut = setInterval(() => {
            if (this.testPath != null && this.testManager.hasChanged == true) {
                this.saveTest(false);  // Closing = false
                console.log("Save to : " + this.testPath + '\\manifest.json');
            }
        }, 3000);
    }

    saveTest(isClosing) {
        // Later ...
        console.log("Saving data !")
        fs.writeFile(this.testPath + '\\manifest.json', JSON.stringify(this.testManager.testData, null, 4), (err) => {
            if (err) throw err;
            console.log('Test is Saved!');
            this.testManager.hasChanged = false;
            if (isClosing) {
                clearInterval(this.timeOut);
                console.log("Regular save interval cleared !");
            }
        });
    }


}

export default FileManager;
