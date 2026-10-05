const $ = id => document.getElementById(id);
const show = id => $(id).classList.remove("hidden");
const hide = id => $(id).classList.add("hidden");
const val = id => parseFloat($(id).value);
const close = (a,b,t) => Number.isFinite(a) && Math.abs(a-b) <= t;

function setFeedback(id,type,text){
  const e=$(id); e.className=`feedback ${type}`; e.textContent=text;
}
function mark(inputId,fbId,ok,text="Correct"){
  const input=$(inputId),fb=$(fbId);
  input.classList.remove("good","bad");
  fb.className="field-feedback";
  if(!input.value){fb.textContent="";return;}
  input.classList.add(ok?"good":"bad");
  fb.classList.add(ok?"good":"bad");
  fb.textContent=ok?`✓ ${text}`:"Check this value";
}

// ---------- constants ----------
const FARM = {
  totalHa:40,
  grazingHa:32,
  silageHa:8,
  cows:80,
  slurryM3:1000
};

const LIME = {
  targetSMP:6.7,
  measuredSMP:6.2,
  blockHa:8,
  maxSingle:7.5
};
LIME.rate=(LIME.targetSMP-LIME.measuredSMP)*12.5; // 6.25
LIME.total=LIME.rate*LIME.blockHa; // 50

const AREA = {
  a40:FARM.grazingHa*.40,
  a15a:FARM.grazingHa*.15,
  a15b:FARM.grazingHa*.15,
  a30:FARM.grazingHa*.30
};

const GAL_TO_M3=0.00454609;
const ACRES_PER_HA=2.471;
function slurryM3(areaHa,galPerAcre){
  return areaHa*ACRES_PER_HA*galPerAcre*GAL_TO_M3;
}
const SPRING = {
  slurry40:slurryM3(AREA.a40,2000),
  slurry15a:slurryM3(AREA.a15a,2500),
  slurry15b:slurryM3(AREA.a15b,2500)
};
SPRING.slurry15s=SPRING.slurry15a+SPRING.slurry15b;
SPRING.slurryTotal=SPRING.slurry40+SPRING.slurry15s;
SPRING.slurryRemaining=FARM.slurryM3-SPRING.slurryTotal;

SPRING.weightedN=(AREA.a40*70 + AREA.a15a*75 + AREA.a15b*83 + AREA.a30*79)/FARM.grazingHa;
SPRING.totalN=SPRING.weightedN*FARM.grazingHa;

const SILAGE = {
  slurryRate:33,
  nPerM3:1.0,
  pPerM3:.5,
  kPerM3:3.5,
  cropN:100,
  productN:.38
};
SILAGE.slurryTotal=SILAGE.slurryRate*FARM.silageHa;
SILAGE.slurryN=SILAGE.slurryRate*SILAGE.nPerM3;
SILAGE.extraN=SILAGE.cropN-SILAGE.slurryN;
SILAGE.product=SILAGE.extraN/SILAGE.productN;
SILAGE.slurryFinal=SPRING.slurryRemaining-SILAGE.slurryTotal;

// ---------- lesson 1 ----------
document.querySelectorAll("[data-first]").forEach(btn=>{
  btn.addEventListener("click",()=>{
    document.querySelectorAll("[data-first]").forEach(b=>b.classList.remove("selected"));
    btn.classList.add("selected");
    if(btn.dataset.first==="ph"){
      setFeedback("firstFeedback","pass","Correct. Start with recent soil tests and lime requirement; soil pH controls nutrient availability and response to fertiliser.");
      show("limeCalc");
    }else{
      const m={
        price:"Price matters later; first establish what the soil actually needs.",
        urea:"Chemical N should not be planned before checking soil fertility and lime.",
        bags:"Bag numbers come only after nutrient requirements and product rates are known."
      };
      setFeedback("firstFeedback","fail",m[btn.dataset.first]);
    }
  });
});

function checkLime(){
  const a=val("limeRate"),b=val("limeTotal"),c=val("limeOnePass");
  mark("limeRate","limeRateFb",close(a,LIME.rate,.03));
  mark("limeTotal","limeTotalFb",close(b,LIME.total,.15));
  mark("limeOnePass","limeOnePassFb",close(c,1,.01),"Yes — rate is below 7.5 t/ha");
  if(![a,b,c].every(Number.isFinite))return;
  const ok=close(a,LIME.rate,.03)&&close(b,LIME.total,.15)&&close(c,1,.01);
  if(ok){
    setFeedback("limeFeedback","pass","Correct. Lime requirement = 6.25 t/ha; over 8 ha this is 50 t. Because 6.25 < 7.5 t/ha, it can be applied in one application.");
    show("lesson2");
  }else{
    setFeedback("limeFeedback","fail","Use (6.7 − 6.2) × 12.5, multiply by 8 ha, then compare the per-ha rate with 7.5 t/ha.");
    ["lesson2","lesson3","lesson4","lesson5","lesson6","summary"].forEach(hide);
  }
}
["limeRate","limeTotal","limeOnePass"].forEach(id=>$(id).addEventListener("input",checkLime));

// ---------- lesson 2 ----------
let timingChoice="";
document.querySelectorAll("[data-timing]").forEach(btn=>{
  btn.addEventListener("click",()=>{
    timingChoice=btn.dataset.timing;
    document.querySelectorAll("[data-timing]").forEach(b=>b.classList.toggle("selected",b===btn));
    if(timingChoice==="slurryfirst"){
      setFeedback("timingFeedback","pass","Correct. Where early slurry is required, apply slurry first and lime about 7 days later. Protected urea does not require a lime interval.");
    }else{
      setFeedback("timingFeedback","fail","Fresh lime can increase loss of ammoniacal N from slurry. In this case slurry first, then lime after about 7 days, is the sensible sequence.");
    }
    checkTiming();
  });
});
function checkTiming(){
  const a=val("monthsAfterLime"),b=val("protectedWait");
  mark("monthsAfterLime","monthsAfterLimeFb",close(a,3,.05));
  mark("protectedWait","protectedWaitFb",close(b,0,.05),"No interval required");
  if(!Number.isFinite(a)||!Number.isFinite(b))return;
  if(timingChoice==="slurryfirst"&&close(a,3,.05)&&close(b,0,.05)){
    show("lesson3");
  }else{
    ["lesson3","lesson4","lesson5","lesson6","summary"].forEach(hide);
  }
}
["monthsAfterLime","protectedWait"].forEach(id=>$(id).addEventListener("input",checkTiming));

// ---------- lesson 3 ----------
function checkSpring(){
  const a=val("area40"),b=val("area15a"),c=val("area15b"),d=val("area30"),e=val("avgSpringN"),f=val("totalSpringN");
  mark("area40","area40Fb",close(a,AREA.a40,.05));
  mark("area15a","area15aFb",close(b,AREA.a15a,.05));
  mark("area15b","area15bFb",close(c,AREA.a15b,.05));
  mark("area30","area30Fb",close(d,AREA.a30,.05));
  mark("avgSpringN","avgSpringNFb",close(e,SPRING.weightedN,.08));
  mark("totalSpringN","totalSpringNFb",close(f,SPRING.totalN,3));
  if(![a,b,c,d,e,f].every(Number.isFinite))return;
  const ok=close(a,AREA.a40,.05)&&close(b,AREA.a15a,.05)&&close(c,AREA.a15b,.05)&&close(d,AREA.a30,.05)&&close(e,SPRING.weightedN,.08)&&close(f,SPRING.totalN,3);
  if(ok){
    setFeedback("springFeedback","pass",`Correct. Areas are ${AREA.a40.toFixed(1)}, ${AREA.a15a.toFixed(1)}, ${AREA.a15b.toFixed(1)} and ${AREA.a30.toFixed(1)} ha. The weighted total is ${SPRING.weightedN.toFixed(1)} kg N/ha, or about ${SPRING.totalN.toFixed(0)} kg N across the grazing platform.`);
    show("lesson4");
  }else{
    setFeedback("springFeedback","fail","Calculate each percentage of 32 ha, then weight the four total-N rates (70, 75, 83 and 79 kg N/ha) by area.");
    ["lesson4","lesson5","lesson6","summary"].forEach(hide);
  }
}
["area40","area15a","area15b","area30","avgSpringN","totalSpringN"].forEach(id=>$(id).addEventListener("input",checkSpring));

// ---------- lesson 4 ----------
function checkSlurry(){
  const a=val("slurry40"),b=val("slurry15s"),c=val("slurrySpringTotal"),d=val("slurryRemaining");
  mark("slurry40","slurry40Fb",close(a,SPRING.slurry40,.7));
  mark("slurry15s","slurry15sFb",close(b,SPRING.slurry15s,.7));
  mark("slurrySpringTotal","slurrySpringTotalFb",close(c,SPRING.slurryTotal,1.0));
  mark("slurryRemaining","slurryRemainingFb",close(d,SPRING.slurryRemaining,1.0));
  if(![a,b,c,d].every(Number.isFinite))return;
  const ok=close(a,SPRING.slurry40,.7)&&close(b,SPRING.slurry15s,.7)&&close(c,SPRING.slurryTotal,1)&&close(d,SPRING.slurryRemaining,1);
  if(ok){
    setFeedback("slurryFeedback","pass",`Correct. Early spring uses about ${SPRING.slurryTotal.toFixed(0)} m³, leaving about ${SPRING.slurryRemaining.toFixed(0)} m³ from the measured 1,000 m³ inventory.`);
    show("lesson5");
  }else{
    setFeedback("slurryFeedback","fail","Convert ha to acres, multiply by gal/ac, then convert gallons to cubic metres.");
    ["lesson5","lesson6","summary"].forEach(hide);
  }
}
["slurry40","slurry15s","slurrySpringTotal","slurryRemaining"].forEach(id=>$(id).addEventListener("input",checkSlurry));

// ---------- lesson 5 ----------
function checkSilage(){
  const a=val("silageSlurry"),b=val("silageSlurryN"),c=val("silageExtraN"),d=val("silageProduct"),e=val("slurryFinal");
  mark("silageSlurry","silageSlurryFb",close(a,SILAGE.slurryTotal,.25));
  mark("silageSlurryN","silageSlurryNFb",close(b,SILAGE.slurryN,.08));
  mark("silageExtraN","silageExtraNFb",close(c,SILAGE.extraN,.08));
  mark("silageProduct","silageProductFb",close(d,SILAGE.product,1.2));
  mark("slurryFinal","slurryFinalFb",close(e,SILAGE.slurryFinal,1.2));
  if(![a,b,c,d,e].every(Number.isFinite))return;
  const ok=close(a,SILAGE.slurryTotal,.25)&&close(b,SILAGE.slurryN,.08)&&close(c,SILAGE.extraN,.08)&&close(d,SILAGE.product,1.2)&&close(e,SILAGE.slurryFinal,1.2);
  if(ok){
    setFeedback("silageFeedback","pass",`Correct. 8 ha × 33 m³/ha = ${SILAGE.slurryTotal.toFixed(0)} m³ slurry. That supplies about 33 kg N/ha, leaving 67 kg N/ha to supply. At 38% N this is about ${SILAGE.product.toFixed(0)} kg product/ha. About ${SILAGE.slurryFinal.toFixed(0)} m³ slurry remains.`);
    show("lesson6");
  }else{
    setFeedback("silageFeedback","fail","Use 33 m³/ha × 8 ha. At 1 kg available N/m³, slurry supplies 33 kg N/ha; subtract this from 100 kg N/ha, then divide by 0.38.");
    ["lesson6","summary"].forEach(hide);
  }
}
["silageSlurry","silageSlurryN","silageExtraN","silageProduct","slurryFinal"].forEach(id=>$(id).addEventListener("input",checkSilage));

// ---------- lesson 6 ----------
function checkSilageTiming(){
  const a=val("sixWeeksDays"),b=val("uptake40"),c=val("latestDay");
  mark("sixWeeksDays","sixWeeksDaysFb",close(a,42,.1));
  mark("uptake40","uptake40Fb",close(b,100,.1));
  mark("latestDay","latestDayFb",close(c,8,.1),"8 April");
  if(![a,b,c].every(Number.isFinite))return;
  const ok=close(a,42,.1)&&close(b,100,.1)&&close(c,8,.1);
  if(ok){
    setFeedback("timingSilageFeedback","pass","Correct. Six weeks = 42 days. At 2.5 kg N/ha/day, 40 days corresponds to 100 kg N/ha uptake. For a 20 May cut, 8 April is 42 days earlier.");
    show("summary");
  }else{
    setFeedback("timingSilageFeedback","fail","Six weeks = 42 days; 2.5 × 40 = 100 kg N/ha; count 42 days back from 20 May.");
    hide("summary");
  }
}
["sixWeeksDays","uptake40","latestDay"].forEach(id=>$(id).addEventListener("input",checkSilageTiming));



// ---------- practice generator ----------
let practiceData=null;

function pick(arr){
  return arr[Math.floor(Math.random()*arr.length)];
}

function generatePractice(){
  const grazingHa=pick([24,28,32,36,40]);
  const slurryStore=pick([900,1000,1100,1200,1300]);
  const limeBlockHa=pick([4,5,6,8]);
  const smp=pick([6.1,6.2,6.3]);

  const a40=grazingHa*.40;
  const a15=grazingHa*.15;
  const a30=grazingHa*.30;

  const weightedN=(a40*70 + a15*75 + a15*83 + a30*79)/grazingHa;
  const totalN=weightedN*grazingHa;

  const slurry40=slurryM3(a40,2000);
  const slurry15s=2*slurryM3(a15,2500);
  const slurryUsed=slurry40+slurry15s;
  const slurryRemaining=slurryStore-slurryUsed;

  const limeRate=(6.7-smp)*12.5;
  const limeTotal=limeRate*limeBlockHa;

  practiceData={
    grazingHa, slurryStore, limeBlockHa, smp,
    a40,a15,a30,weightedN,totalN,slurryUsed,slurryRemaining,limeRate,limeTotal
  };

  $("practiceCase").innerHTML=`
    <p><strong>Grazing platform:</strong> ${grazingHa} ha</p>
    <p><strong>Measured cattle-slurry inventory:</strong> ${slurryStore} m³</p>
    <p><strong>Lime block:</strong> ${limeBlockHa} ha, measured SMP pH ${smp.toFixed(1)}</p>
    <p><strong>Spring programme:</strong> use the same 40% / 15% / 15% / 30% well-drained strategy.</p>
  `;

  ["pArea40","pArea15","pArea30","pWeightedN","pTotalN","pSlurryUsed","pSlurryRemaining","pLimeRate","pLimeTotal"].forEach(id=>{
    $(id).value="";
    $(id).classList.remove("good","bad");
  });
  ["pArea40Fb","pArea15Fb","pArea30Fb","pWeightedNFb","pTotalNFb","pSlurryUsedFb","pSlurryRemainingFb","pLimeRateFb","pLimeTotalFb"].forEach(id=>{
    $(id).textContent="";
    $(id).className="field-feedback";
  });
  setFeedback("practiceFeedback","neutral","Complete the generated case, then press “Mark this attempt”.");
}

function checkPracticeLive(){
  if(!practiceData)return;
  const p=practiceData;

  mark("pArea40","pArea40Fb",close(val("pArea40"),p.a40,.06));
  mark("pArea15","pArea15Fb",close(val("pArea15"),p.a15,.06));
  mark("pArea30","pArea30Fb",close(val("pArea30"),p.a30,.06));
  mark("pWeightedN","pWeightedNFb",close(val("pWeightedN"),p.weightedN,.08));
  mark("pTotalN","pTotalNFb",close(val("pTotalN"),p.totalN,3));
  mark("pSlurryUsed","pSlurryUsedFb",close(val("pSlurryUsed"),p.slurryUsed,1.0));
  mark("pSlurryRemaining","pSlurryRemainingFb",close(val("pSlurryRemaining"),p.slurryRemaining,1.0));
  mark("pLimeRate","pLimeRateFb",close(val("pLimeRate"),p.limeRate,.03));
  mark("pLimeTotal","pLimeTotalFb",close(val("pLimeTotal"),p.limeTotal,.2));

  const ids=["pArea40","pArea15","pArea30","pWeightedN","pTotalN","pSlurryUsed","pSlurryRemaining","pLimeRate","pLimeTotal"];
  if(ids.every(id=>Number.isFinite(val(id)))){
    const arr=[
      close(val("pArea40"),p.a40,.06),
      close(val("pArea15"),p.a15,.06),
      close(val("pArea30"),p.a30,.06),
      close(val("pWeightedN"),p.weightedN,.08),
      close(val("pTotalN"),p.totalN,3),
      close(val("pSlurryUsed"),p.slurryUsed,1.0),
      close(val("pSlurryRemaining"),p.slurryRemaining,1.0),
      close(val("pLimeRate"),p.limeRate,.03),
      close(val("pLimeTotal"),p.limeTotal,.2)
    ];
    const correct=arr.filter(Boolean).length;
    setFeedback(
      "practiceFeedback",
      correct===arr.length?"pass":"warn",
      correct===arr.length
        ? "All calculations are correct. Record the attempt when you are ready."
        : `${correct} of ${arr.length} parts are currently correct.`
    );
  }
}

$("openPractice").addEventListener("click",()=>{
  show("practice");
  if(!practiceData)generatePractice();
  $("practice").scrollIntoView({behavior:"smooth",block:"start"});
});
$("newPractice").addEventListener("click",generatePractice);

["pArea40","pArea15","pArea30","pWeightedN","pTotalN","pSlurryUsed","pSlurryRemaining","pLimeRate","pLimeTotal"].forEach(id=>{
  $(id).addEventListener("input",checkPracticeLive);
});

// ---------- scoring ----------
const SCORE_KEY="limeFertiliserTutorScoresV1";
const labels={
  lesson1:"1 · Lime requirement",
  lesson2:"2 · Lime/slurry timing",
  lesson3:"3 · Well-drained spring N plan",
  lesson4:"4 · Slurry inventory",
  lesson5:"5 · First-cut silage",
  lesson6:"6 · Silage timing",
  practice:"Practice generator"
};
function emptyScores(){
  const o={}; Object.keys(labels).forEach(k=>o[k]={attempts:0,success:0,fail:0,best:0,completed:false}); return o;
}
function loadScores(){try{return {...emptyScores(),...JSON.parse(localStorage.getItem(SCORE_KEY)||"{}")};}catch(e){return emptyScores();}}
let scores=loadScores();
function saveScores(){localStorage.setItem(SCORE_KEY,JSON.stringify(scores));}

function resultFor(key){
  if(key==="lesson1"){
    const arr=[close(val("limeRate"),LIME.rate,.03),close(val("limeTotal"),LIME.total,.15),close(val("limeOnePass"),1,.01)];
    if(["limeRate","limeTotal","limeOnePass"].some(id=>!Number.isFinite(val(id))))return null;
    return arr;
  }
  if(key==="lesson2"){
    if(!timingChoice||["monthsAfterLime","protectedWait"].some(id=>!Number.isFinite(val(id))))return null;
    return [timingChoice==="slurryfirst",close(val("monthsAfterLime"),3,.05),close(val("protectedWait"),0,.05)];
  }
  if(key==="lesson3"){
    const ids=["area40","area15a","area15b","area30","avgSpringN","totalSpringN"]; if(ids.some(id=>!Number.isFinite(val(id))))return null;
    return [close(val("area40"),AREA.a40,.05),close(val("area15a"),AREA.a15a,.05),close(val("area15b"),AREA.a15b,.05),close(val("area30"),AREA.a30,.05),close(val("avgSpringN"),SPRING.weightedN,.08),close(val("totalSpringN"),SPRING.totalN,3)];
  }
  if(key==="lesson4"){
    const ids=["slurry40","slurry15s","slurrySpringTotal","slurryRemaining"]; if(ids.some(id=>!Number.isFinite(val(id))))return null;
    return [close(val("slurry40"),SPRING.slurry40,.7),close(val("slurry15s"),SPRING.slurry15s,.7),close(val("slurrySpringTotal"),SPRING.slurryTotal,1),close(val("slurryRemaining"),SPRING.slurryRemaining,1)];
  }
  if(key==="lesson5"){
    const ids=["silageSlurry","silageSlurryN","silageExtraN","silageProduct","slurryFinal"]; if(ids.some(id=>!Number.isFinite(val(id))))return null;
    return [close(val("silageSlurry"),SILAGE.slurryTotal,.25),close(val("silageSlurryN"),SILAGE.slurryN,.08),close(val("silageExtraN"),SILAGE.extraN,.08),close(val("silageProduct"),SILAGE.product,1.2),close(val("slurryFinal"),SILAGE.slurryFinal,1.2)];
  }
  if(key==="lesson6"){
    const ids=["sixWeeksDays","uptake40","latestDay"]; if(ids.some(id=>!Number.isFinite(val(id))))return null;
    return [close(val("sixWeeksDays"),42,.1),close(val("uptake40"),100,.1),close(val("latestDay"),8,.1)];
  }
  if(key==="practice"){
    if(!practiceData)return null;
    const ids=["pArea40","pArea15","pArea30","pWeightedN","pTotalN","pSlurryUsed","pSlurryRemaining","pLimeRate","pLimeTotal"];
    if(ids.some(id=>!Number.isFinite(val(id))))return null;
    const p=practiceData;
    return [
      close(val("pArea40"),p.a40,.06),
      close(val("pArea15"),p.a15,.06),
      close(val("pArea30"),p.a30,.06),
      close(val("pWeightedN"),p.weightedN,.08),
      close(val("pTotalN"),p.totalN,3),
      close(val("pSlurryUsed"),p.slurryUsed,1.0),
      close(val("pSlurryRemaining"),p.slurryRemaining,1.0),
      close(val("pLimeRate"),p.limeRate,.03),
      close(val("pLimeTotal"),p.limeTotal,.2)
    ];
  }
  return null;
}
function recordAttempt(key){
  const arr=resultFor(key);
  if(!arr){alert("Complete all answers in this lesson before marking.");return;}
  const correct=arr.filter(Boolean).length,total=arr.length,pct=Math.round(correct/total*100),success=correct===total;
  const s=scores[key]; s.attempts++; if(success){s.success++;s.completed=true;}else{s.fail++;} s.best=Math.max(s.best,pct);
  saveScores(); renderScores();
  alert(success?`Marked: ${pct}% — successful.`:`Marked: ${pct}% — ${correct} of ${total} parts correct. Try again.`);
}
function renderScores(){
  const tbody=$("scoreTable").querySelector("tbody"); tbody.innerHTML="";
  let attempts=0,success=0,fail=0,completed=0;
  Object.keys(labels).forEach(k=>{
    const s=scores[k];attempts+=s.attempts;success+=s.success;fail+=s.fail;if(s.completed)completed++;
    const tr=document.createElement("tr");
    tr.innerHTML=`<td>${labels[k]}</td><td>${s.attempts}</td><td>${s.success}</td><td>${s.fail}</td><td>${s.attempts?s.best+"%":"—"}</td><td><span class="status-pill ${s.completed?"complete":"incomplete"}">${s.completed?"Completed":"Not completed"}</span></td>`;
    tbody.appendChild(tr);
  });
  $("scoreAttempts").textContent=attempts;$("scoreSuccess").textContent=success;$("scoreFail").textContent=fail;$("scoreCompleted").textContent=`${completed} / 7`;$("overallScore").textContent=`${attempts?Math.round(success/attempts*100):0}%`;
}
["1","2","3","4","5","6"].forEach(n=>$( "markLesson"+n ).addEventListener("click",()=>recordAttempt("lesson"+n)));
$("markPractice").addEventListener("click",()=>recordAttempt("practice"));
$("resetScores").addEventListener("click",()=>{if(confirm("Reset all marks on this browser?")){scores=emptyScores();saveScores();renderScores();}});
$("downloadScores").addEventListener("click",()=>{
  const rows=[["Exercise","Attempts","Successful","Unsuccessful","Best","Completed"]];
  Object.keys(labels).forEach(k=>{const s=scores[k];rows.push([labels[k],s.attempts,s.success,s.fail,s.attempts?s.best+"%":"",s.completed?"Yes":"No"]);});
  const csv=rows.map(r=>r.map(x=>`"${String(x??"").replaceAll('"','""')}"`).join(",")).join("\n");
  const blob=new Blob([csv],{type:"text/csv;charset=utf-8;"}),url=URL.createObjectURL(blob),a=document.createElement("a");
  a.href=url;a.download="lime-fertiliser-tutor-marks.csv";document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);
});
renderScores();
