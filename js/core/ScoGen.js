

class scormGen {

    constructor(tData, testPath) {

        this.tData = tData;
        this.testPath = testPath;

    }

    generate() {

        this.questions = new Array();   // array to save question's text with the correct answer number !

        if (['darwin', 'linux'].includes(process.platform)) {
            this.prepareFolderMacLinux();
        } else if (process.platform == 'win32') this.prepareFolder();

        this.makeTest(this.tData.questions);

    }

    prepareFolderMacLinux() {

        if (fs.existsSync(this.testPath)) {

            if (fs.existsSync(this.testPath + '/ScoTEST')) {
                fs.rmdirSync(this.testPath + '/ScoTEST', { recursive: true });
            }

            fs.mkdirSync(this.testPath + '/ScoTEST');

            fs.mkdirSync(this.testPath + '/ScoTEST/medias');   // pictures folder

            fs.mkdirSync(this.testPath + '/ScoTEST/html');   // test html file 
            fs.mkdirSync(this.testPath + '/ScoTEST/html/css');   // 
            fs.mkdirSync(this.testPath + '/ScoTEST/html/js');   // 


            //-----> copy all the media files to the scorm media folder !
            fs.readdir(this.testPath + '/medias', (err, files) => {
                //handling error
                if (err) {
                    return console.log('Unable to scan directory: ' + err);
                }
                //listing all files using forEach
                files.forEach((file) => {
                    // Do whatever you want to do with the file

                    fs.copyFileSync(this.testPath + '/medias/' + file, this.testPath + '/ScoTEST/medias/' + file);
                });

            });

            // copy the scorm configuration  files to the scorom folder

            let scoCONF = path.join(__dirname, '../scoGEN');
            // Copie des fichiers de configuration SCORM dans le dossier généré cible  ( scormPath )
            fs.copyFileSync(scoCONF + '/adlcp_rootv1p2.xsd', this.testPath + '/ScoTEST/adlcp_rootv1p2.xsd');
            fs.copyFileSync(scoCONF + '/ims_xml.xsd', this.testPath + '/ScoTEST/ims_xml.xsd');
            fs.copyFileSync(scoCONF + '/imscp_rootv1p1p2.xsd', this.testPath + '/ScoTEST/imscp_rootv1p1p2.xsd');
            fs.copyFileSync(scoCONF + '/imsmd_rootv1p2p1.xsd', this.testPath + '/ScoTEST/imsmd_rootv1p2p1.xsd');
            fs.copyFileSync(scoCONF + '/imsmanifest.xml', this.testPath + '/ScoTEST/imsmanifest.xml');

            fs.copyFileSync(scoCONF + '/finish.png', this.testPath + '/ScoTEST/medias/finish.png');
            // copier le fichier de style du test HTML
            fs.copyFileSync(scoCONF + '/style.css', this.testPath + '/ScoTEST/html/css/style.css');
            // copier le fichier JS scormfunctions.js 
            fs.copyFileSync(scoCONF + '/scormfunctions.js', this.testPath + '/ScoTEST/html/js/scormfunctions.js');
        }

    }

    prepareFolder() {

        if (fs.existsSync(this.testPath)) {

            if (fs.existsSync(this.testPath + '\\ScoTEST')) {
                fs.rmdirSync(this.testPath + '\\ScoTEST', { recursive: true });
            }

            fs.mkdirSync(this.testPath + '\\ScoTEST');

            fs.mkdirSync(this.testPath + '\\ScoTEST\\medias');   // pictures folder

            fs.mkdirSync(this.testPath + '\\ScoTEST\\html');   // test html file 
            fs.mkdirSync(this.testPath + '\\ScoTEST\\html\\css');   // 
            fs.mkdirSync(this.testPath + '\\ScoTEST\\html\\js');   // 


            //-----> copy all the media files to the scorm media folder !
            fs.readdir(this.testPath + '\\medias', (err, files) => {
                //handling error
                if (err) {
                    return console.log('Unable to scan directory: ' + err);
                }
                //listing all files using forEach
                files.forEach((file) => {
                    // Do whatever you want to do with the file

                    fs.copyFileSync(this.testPath + '\\medias\\' + file, this.testPath + '\\ScoTEST\\medias\\' + file);
                });

            });

            // copy the scorm configuration  files to the scorom folder

            let scoCONF = path.join(__dirname, '../scoGEN');
            // Copie des fichiers de configuration SCORM dans le dossier généré cible  ( scormPath )
            fs.copyFileSync(scoCONF + '\\adlcp_rootv1p2.xsd', this.testPath + '\\ScoTEST\\adlcp_rootv1p2.xsd');
            fs.copyFileSync(scoCONF + '\\ims_xml.xsd', this.testPath + '\\ScoTEST\\ims_xml.xsd');
            fs.copyFileSync(scoCONF + '\\imscp_rootv1p1p2.xsd', this.testPath + '\\ScoTEST\\imscp_rootv1p1p2.xsd');
            fs.copyFileSync(scoCONF + '\\imsmd_rootv1p2p1.xsd', this.testPath + '\\ScoTEST\\imsmd_rootv1p2p1.xsd');
            fs.copyFileSync(scoCONF + '\\imsmanifest.xml', this.testPath + '\\ScoTEST\\imsmanifest.xml');

            fs.copyFileSync(scoCONF + '\\finish.png', this.testPath + '\\ScoTEST\\medias\\finish.png');
            // copier le fichier de style du test HTML
            fs.copyFileSync(scoCONF + '\\style.css', this.testPath + '\\ScoTEST\\html\\css\\style.css');
            // copier le fichier JS scormfunctions.js 
            fs.copyFileSync(scoCONF + '\\scormfunctions.js', this.testPath + '\\ScoTEST\\html\\js\\scormfunctions.js');
            // copier le fichier JS display.js 
            fs.copyFileSync(scoCONF + '\\display.js', this.testPath + '\\ScoTEST\\html\\js\\display.js');
            if (this.tData.params.bayesian == true) {
                // copier le fichier JS per.js    
                fs.copyFileSync(scoCONF + '\\per.js', this.testPath + '\\ScoTEST\\html\\js\\per.js');
            }
        }

    }

    makeTest(qList) {

        let doc = `<html> <head><link rel="stylesheet" href="css/style.css"><script src="js/scormfunctions.js"  type="text/javascript"></script></head><body onload="loadFunction();" oncontextmenu = "return false">`;

        doc += `<div id="test"></div>
                <div id="control">
                    <button class="Gbuton" id="btsubmit">Envoyer les reponses</button>
                    <span id="timer"> 10 : 59 </span>
                </div>
                <div id="finish" >
                    <span class="end"> 
                        <center>Fin du test. Vos réponses sont envoyées !
                            Appuyez sur "Terminer l'activite" pour revenir au cours.</center>
                    </span>
                    <center><img src="../medias/finish.png"/></center>
                </div>
                <script src="js/testQCM.js"></script>
                <script src="js/display.js"></script>`;
        if (this.tData.params.bayesian == true) {
            doc += `<script src="js/per.js"></script>`;
        }

        if (this.tData.params.receiveAnswers == true && Object.keys(this.tData.params.dbConfig).length > 0) {

            doc += `<script src="https://www.gstatic.com/firebasejs/8.0.1/firebase-app.js"></script>
                            <script src="https://www.gstatic.com/firebasejs/8.0.1/firebase-database.js"></script>
                            <script>
                            // TODO: Replace the following with your app's Firebase project configuration
                            
                            var firebaseConfig = JSON.parse('${JSON.stringify(this.tData.params.dbConfig)}');
                            // Initialize Firebase
                            firebase.initializeApp(firebaseConfig);
                            var database = firebase.database();
                            </script>`;
        }

        doc += `</body></html>`;
        if (['darwin', 'linux'].includes(process.platform)) {
            fs.writeFileSync(this.testPath + '/ScoTEST/html/index.html', doc);
        } else if (process.platform == 'win32') fs.writeFileSync(this.testPath + '\\ScoTEST\\html\\index.html', doc);


        this.makeJS(this.makeQuestions(qList));

        //console.log(this.questions);
    }

    makeJS(questionsDOM) {

        let jsCode = `var quest = "${Buffer.from(JSON.stringify(questionsDOM)).toString('base64')}"; 
                       var i=0;
                       var j=0; 
                       var cc = "${Buffer.from(JSON.stringify(this.questions)).toString('base64')}"; 
                       var params =  "${Buffer.from(JSON.stringify(this.tData.params)).toString('base64')}";
                    `

        if (this.tData.params.bayesian == false) {
            jsCode += ` function checkAnswer() {
                            //Check correct answers and calculate score
                            let score = 0;
                            let c=JSON.parse(atob(cc));
                            let userAnswers = [];
                            for ( i=0 ; i <c.length ; i++) {
                                var rbs = document.querySelectorAll(\`input[name="q\${i+1}"]\`);   //rbs = radio buttons
                                var ua = {qn:\`q\${i+1}\`, qt: c[i].qText, uc:0, at:'', state: false};
                                for (var rb of rbs) {
                                    if (rb.checked) {
                                        ua.at = rb.value;
                                        ua.uc = rb.getAttribute('aID');
                                        ua.state = ( ua.uc == c[i].a )?true: false;
                                        if(ua.state) score++;
                                        break;
                                    }
                                }
                                userAnswers.push(ua);
                            }
                            let S = Math.round((score/c.length)*20);`;
            if (this.tData.params.receiveAnswers == true && Object.keys(this.tData.params.dbConfig).length > 0) {
                jsCode += `// Save Answers to DB
                                           saveToDB(S,userAnswers);  //---> this function is defined in display.js
                                }`
            }
        } else {
            //-------> TODO !!
            jsCode += ` function checkAnswer() {
                                 console.log("check bayesian answers !!");
                                 checkAnswerB();
                        }`
        }

        if (['darwin', 'linux'].includes(process.platform)) {
            fs.writeFileSync(this.testPath + '/ScoTEST/html/js/testQCM.js', jsCode);
        } else if (process.platform == 'win32') fs.writeFileSync(this.testPath + '\\ScoTEST\\html\\js\\testQCM.js', jsCode);

    }

    makeQuestions(qList) {

        let questions = [];

        let i = 1;
        qList.forEach(qData => {
            questions.push(this.makeQuestion(qData, i++));
        });

        return questions;
    }

    makeQuestion(qData, qnumber) {


        let question = {
            qDom: '',
            answers: []
        }

        let questionDOM = ``;


        questionDOM += `<div class= 'questionZone'>    
                            <div class='questionText'>
                                <span class='qNumber'>Question ${qnumber}:</span> 
                                ${qData.qText}
                            </div>
                            <div class='questionPicture'>`;

        if (qData.qImg != '') {
            questionDOM += `<center> <img src='..${qData.qImg.replace(/\\/g, "/")}' /> </center>`
        }
        if (this.tData.params.bayesian == false) {
            questionDOM += `</div> </div> <div class='answerZone' qid="${qData.quid}"> </div>`;
        } else {
            questionDOM += `</div> </div> <div class='answerZone' p="100" qid="${qData.quid}"> </div>`;    //p=100 
        }

        //create answers
        this.questions.push({ qUID: qData.quid, qText: qData.qText, a: 0 });
        question.qDom = questionDOM;
        question.answers = this.makeAnswers(qData.answers, qnumber);


        return question;
    }

    makeAnswers(aList, qnumber) {    // aList is the answer list for a question

        let answers = [];

        let answerNumber = 1;
        aList.forEach(aData => {
            answers.push(this.makeAnswer(aData, qnumber, answerNumber++));
        });

        return answers;

    }

    makeAnswer(aData, qnumber, answerNumber) {

        let answerDOM = '';

        if (this.tData.params.bayesian == false) {    // Simple test with radio button for UI
            answerDOM = ` <div class='answerItem'>
                                    <div class='answerText'>
                                        <span> <input type='radio' name='q${qnumber}' value = "${aData.aText}"  aID = '${answerNumber}' /> ${aData.aText} </span>
                                    </div>
                                    <div class='answerPicture'>`;

        } else {
            answerDOM = `<div class="answerItemB"  name='q${qnumber}' value = "${aData.aText}" aID="${answerNumber}">
                            <div class="answerText">
                                <span>  ${aData.aText}  </span>
                                <div class="percent"> <div class="plus">+</div><div class="nbrP" v="0"> 0%</div> <div class="minus">-</div> </div>
                            </div>
                            <div class='answerPicture'>`;
        }

        if (aData.aPicture != '') {
            answerDOM += `<center> <img src='..${aData.aPicture.replace(/\\/g, "/")}' /> </center>`;
        }
        answerDOM += `</div></div>`;

        if (aData.isCorrect == true) this.questions[qnumber - 1].a = answerNumber;

        return answerDOM;
    }



}

export default scormGen;