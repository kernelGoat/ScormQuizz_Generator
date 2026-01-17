//Ce fichier gere les actions sur les choix en % pour chaque question
function initClickEvent() {

    let plus = document.getElementsByClassName("plus")
    let minus = document.getElementsByClassName("minus")
    //console.log(plus)

    for (let i = 0 ; i < plus.length; i++) {
        let p = plus[i];

        plus[i].addEventListener("click", ()=> {
            let azone = p.parentElement.parentElement.parentElement.parentElement
            let nbrP = p.parentElement.getElementsByClassName("nbrP")
            let qpercent = azone.getAttribute("p")
            let itemPercent = nbrP[0].getAttribute("v")

            //console.log("question per : "+qpercent)
            //console.log("answer per : "+itemPercent)

            if ( parseInt(qpercent) > 0 ) {
                //console.log("ici")
                itemPercent= parseInt(itemPercent) +  10
                qpercent= parseInt(qpercent) - 10
                
                nbrP[0].innerHTML = itemPercent+"%"
                nbrP[0].setAttribute("v",itemPercent)
                azone.setAttribute("p",qpercent)
                //console.log(nbrP)
            }else {
                //console.log("labas")
            }

        
        },false)


    }

    for (let i = 0 ; i < minus.length; i++) {
        let m = minus[i];

        minus[i].addEventListener("click", ()=> {
            let azone = m.parentElement.parentElement.parentElement.parentElement
            let nbrP = m.parentElement.getElementsByClassName("nbrP")
            let qpercent = azone.getAttribute("p")
            let itemPercent = nbrP[0].getAttribute("v")

            //console.log("question per : "+qpercent)
            //console.log("answer per : "+itemPercent)

            if ( parseInt(qpercent) < 100 ) {
                if ( parseInt(itemPercent) >0)
                {    //console.log("ici")
                    itemPercent= parseInt(itemPercent) -  10
                    qpercent= parseInt(qpercent) + 10
                    
                    nbrP[0].innerHTML = itemPercent+"%"
                    nbrP[0].setAttribute("v",itemPercent)
                    azone.setAttribute("p",qpercent)
                    //console.log(nbrP)
                }
            }else {
                //console.log("labas")
            }

        
        },false)

    }

}

function getQuestionInfo(qid){
    let cc = JSON.parse(atob(c));
    for(let i = 0; i< cc.length; i++){
        if (cc[i].qUID == qid ) 
            return {cAnswer:cc[i].a, qText:cc[i].qText};
    }
    return null;
}
 
function checkAnswerB(){
    //Equation de score :    S(p) = 1 - SOmme[ power( %student - %answer ) ]
    //----------------------------------------------------------------------
    //----------------------------------------------------------------------
    answerZones = Array.from(document.getElementsByClassName("answerZone"));  //-----------> All the answer zones of the test
    let score = 0;
    let userAnswers=new Array();                                                            //-----------> score is the total score of the test !
    answerZones.forEach(element => {
        qID = element.getAttribute("qid"); // get the question ID from the answerzone
        qInfo = getQuestionInfo(qID);
        qText = qInfo.qText;               // the question text
        cAnswerID = qInfo.cAnswer;         // the correct answer for the question qid

        aItem= Array.from(element.getElementsByClassName("answerItemB"));   //-------------> list of answers for the question qID
        let sum = 0;                                                        //---------> sum is used to calculate the score of the current question
        let userChoices = new Array();                                                   
        aItem.forEach(ai => {
            let aid = ai.getAttribute("aid");
            let aText = ai.getAttribute("value");                                         //-------> Answer text
            let ap = parseInt(ai.getElementsByClassName("nbrP")[0].getAttribute("v"));    // ap is the answer percent given by the student
            let pAnswer = (aid == cAnswerID)?1:0;                                         //--------> pAnswer = 1 is it's the correct answer
            sum+= Math.pow((ap/100 - pAnswer),2);
            //---> TODO
            //Store user answers in custom OBJECT
            userChoices.push({ Answer_Text:aText, percent:ap , rAnswer: (pAnswer==1)?true:false });  //rAnswer means "right answer" 

        });
        sum = 1 - sum;
        userAnswers.push({qText:qText, answers:userChoices, qScore:(sum*2).toFixed(2) });
        //console.log("question score = "+(sum*2).toFixed(2));
        score+=(sum*2);
    });
    //console.log(userAnswers);
    //Store score and userAnswers to DataBASE !    
    saveToDB(score,userAnswers);
}

initClickEvent();