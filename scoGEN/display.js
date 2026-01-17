
let btsubmit = document.getElementById("btsubmit");
btsubmit.addEventListener("click", function() {
    checkAnswer();    // ------> this function depends on the test type ( simple or bayesian )
});
let  paramss=JSON.parse(atob(params));
//Mix Answers
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function b64DecodeUnicode(str) {
    // Going backwards: from bytestream, to percent-encoding, to original string.
    return decodeURIComponent(atob(str).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
}

function showQuestions() {
    let q=JSON.parse(b64DecodeUnicode(quest));
    for( i=0; i < q.length; i++ ){
        let question = document.createElement("div");
        question.setAttribute("class","question");
        question.innerHTML = q[i].qDom;
        document.getElementById("test").appendChild(question); 
        
        if (paramss.mixAnswers == true) {
            shuffleArray(q[i].answers); 
        }
        for ( j=0; j < q[i].answers.length; j++ ) {
           question.getElementsByClassName("answerZone")[0].innerHTML += q[i].answers[j];
        }
    }
    startTimer();
}

function saveToDB(S,userAnswers) {
    var studentName = ScormProcessGetValue("cmi.core.student_name");
    firebase.database().ref("tests/Test"+paramss.testID+"/"+studentName).set({"score":S, "answers" : userAnswers});
    RecordTest(S);  //----> send score to LMS
}

// This function is called from --> showQuestions()
function startTimer() {

    let minutes = parseInt(paramss.period);
    let secondes = 59;
    let m = 0;
    let s = 0;
    let timerDom = document.getElementById('timer');
    if (minutes != 0 ) {
        minutes--;
        timer = setInterval(() => {
                
               if (minutes == 0 && secondes == 0) checkAnswer();
               else {
                    if ( secondes == 0 ) { secondes = 59; minutes = minutes - 1; }
                    else secondes = secondes-1;
                    
                    if ( minutes < 10 ) m = `0${minutes}`; else m = minutes;
                    if ( secondes < 10 ) s = '0'+secondes; else s = secondes;
                    timerDom.innerText = m+' : '+s;
                } 
        }, 1000);
    }
}


showQuestions();


let TA = window.parent.parent.document.getElementsByClassName("btn btn-secondary")[0];
TA.style.display="none";
let cont = document.getElementById("control");
let clock = document.getElementById("timer");
TA.parentElement.append(cont);

btsubmit.style.cssText=`position: relative;
                        display: inline-block;
                        height: 40px;
                        border-style: none;
                        background-color: rgb(103,58,183);
                        color: white;
                        padding-left: 10px;
                        padding-right: 10px;
                        border-radius: 5px;
                        font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif;
                        font-size:90%;
                        outline:none;
                        cursor: pointer;
                        left:5px;
                        top:-3px;`;

cont.style.cssText=`position:relative;
                    height: fit-content;
                    width: fit-content;
                    border-bottom-style: solid;
                    border-left-style: solid;
                    border-radius: 10px;
                    border-width: 3px;
                    border-color:  rgb(103,58,183);
                    background-color: rgb(255, 255, 255);
                    padding-top:5px;`
clock.style.cssText=`position:relative;
                    margin-left:3px;
                    margin-right:10px;
                    font-size: 140%;
                    top: 0px;
                    font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif;`;
