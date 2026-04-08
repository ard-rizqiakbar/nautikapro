// ============================================================
// MATERIAL
// ============================================================
function openRule(sId,ri){
  ST.curSec=sId;ST.curRule=ri;
  const sec=SECS.find(s=>s.id===sId);
  const rule=sec.ruleList[ri];
  document.getElementById('matLbl').textContent=`${sec.title} · Aturan ${rule.num}`;
  document.getElementById('matLbl').style.color=sec.col;
  document.getElementById('matSub').textContent=rule.title;
  document.getElementById('matTitle').textContent=`Aturan ${rule.num} — ${rule.title}`;
  document.getElementById('matTitle').style.color=sec.col;
  document.getElementById('matBody').innerHTML=rule.mat;
  document.getElementById('matKP').innerHTML=rule.kp;
  setRuP(sId,ri,{read:true});
  show('mat');
}
function startRuleQuiz(){ST.mcA={};ST.mcIdx=0;renderMC();show('mc');}

// ============================================================
// MC QUIZ
// ============================================================
function renderMC(){
  const sec=SECS.find(s=>s.id===ST.curSec);
  const rule=sec.ruleList[ST.curRule];
  const q=rule.mc[ST.mcIdx];
  const tot=rule.mc.length;
  document.getElementById('mcLbl').textContent=`Aturan ${rule.num} · Pilihan Ganda`;
  document.getElementById('mcLbl').style.color=sec.col;
  document.getElementById('mcCtr').textContent=`${ST.mcIdx+1} / ${tot}`;
  document.getElementById('mcBar').style.width=`${((ST.mcIdx+1)/tot)*100}%`;
  document.getElementById('mcBar').style.background=sec.col;
  document.getElementById('mcNum').textContent=`SOAL ${ST.mcIdx+1} DARI ${tot}`;
  document.getElementById('mcQ').textContent=q.q;
  const opts=document.getElementById('mcOpts');opts.innerHTML='';
  ['A','B','C','D'].forEach((lbl,i)=>{
    if(i>=q.o.length)return;
    const btn=document.createElement('button');btn.className='ob';
    btn.innerHTML=`<span class="ol">${lbl}</span><span>${q.o[i]}</span>`;
    btn.onclick=()=>pickOpt(i);opts.appendChild(btn);
  });
  document.getElementById('mcExp').classList.add('hi');
  document.getElementById('mcNext').classList.add('hi');
}
function pickOpt(idx){
  if(ST.mcA[ST.mcIdx]!==undefined)return;
  ST.mcA[ST.mcIdx]=idx;
  const sec=SECS.find(s=>s.id===ST.curSec);
  const q=sec.ruleList[ST.curRule].mc[ST.mcIdx];
  const ok=idx===q.a;
  document.querySelectorAll('.ob').forEach((btn,i)=>{
    btn.disabled=true;
    if(i===q.a)btn.classList.add('ok');
    else if(i===idx&&!ok)btn.classList.add('ng');
    else btn.classList.add('dm');
    const l=btn.querySelector('.ol');
    if(i===q.a)l.textContent='✓';else if(i===idx&&!ok)l.textContent='✗';
  });
  const ex=document.getElementById('mcExp');
  ex.className='exp '+(ok?'ek':'en');
  ex.innerHTML=`<div style="font-weight:700;margin-bottom:5px;">${ok?'✅ Benar!':'❌ Salah'}</div>${q.e}`;
  ex.classList.remove('hi');
  const nb=document.getElementById('mcNext');
  nb.textContent=ST.mcIdx===sec.ruleList[ST.curRule].mc.length-1?'Lihat Hasil →':'Soal Berikutnya →';
  nb.classList.remove('hi');
}
function nextMC(){
  const sec=SECS.find(s=>s.id===ST.curSec);
  const rule=sec.ruleList[ST.curRule];
  const isLast=ST.mcIdx===rule.mc.length-1;
  if(!isLast){ST.mcIdx++;renderMC();return;}
  let ok=0;rule.mc.forEach((_,i)=>{if(ST.mcA[i]===rule.mc[i].a)ok++;});
  const score=Math.round((ok/rule.mc.length)*100);
  const pass=score>=70;
  setRuP(ST.curSec,ST.curRule,{score,pass});
  // Render results
  const rc=document.getElementById('resCard');
  rc.style.borderColor=pass?'rgba(34,197,94,.5)':'rgba(239,68,68,.4)';
  document.getElementById('resEmo').textContent=pass?'🎉':'📚';
  document.getElementById('resScore').textContent=score+'%';
  document.getElementById('resScore').style.color=pass?'var(--grn)':'var(--red)';
  document.getElementById('resLbl').textContent=pass?'Selamat! Lulus!':'Belum Lulus. Ulangi lagi!';
  document.getElementById('resLbl').style.color=pass?'var(--grn)':'var(--red)';
  document.getElementById('resDet').textContent=`${ok} benar dari ${rule.mc.length} soal · Target ≥70%`;
  const rl=document.getElementById('recapList');rl.innerHTML='';
  rule.mc.forEach((q,i)=>{
    const good=ST.mcA[i]===q.a;
    const d=document.createElement('div');d.className='ri';
    d.innerHTML=`<div class="rd ${good?'rk':'rn'}">${good?'✓':'✗'}</div><div><div style="font-size:13px;">${q.q.substring(0,88)}…</div>${!good?`<div style="font-size:12px;color:var(--red);margin-top:2px;">Kamu: ${['A','B','C','D'][ST.mcA[i]]} · Benar: ${['A','B','C','D'][q.a]}</div>`:''}</div>`;
    rl.appendChild(d);
  });
  const ra=document.getElementById('resActs');
  const nextRi=ST.curRule+1;
  const hasNext=nextRi<sec.ruleList.length;
  if(pass){
    ra.innerHTML=hasNext
      ?`<button class="b bg" onclick="openRule('${ST.curSec}',${nextRi})">Lanjut ke Aturan ${sec.ruleList[nextRi].num} →</button><button class="b bgh" onclick="startRuleQuiz()">⟳ Ulangi Soal Ini</button>`
      :`<div class="c" style="padding:14px;border-color:rgba(201,168,76,.4);text-align:center;"><div style="color:var(--gold);font-weight:700;margin-bottom:5px;">✅ Semua Aturan Lulus!</div><div style="font-size:13px;color:var(--mut2);">Kerjakan Esai untuk menyelesaikan Bagian ${ST.curSec}</div></div>
         <button class="b bg" onclick="startEssay('${ST.curSec}')">✍️ Mulai Esai Bagian ${ST.curSec} →</button>
         <button class="b bgh" onclick="exitSec()">Kembali ke Daftar Aturan</button>`;
  } else {
    ra.innerHTML=`<button class="b bg" onclick="openRule('${ST.curSec}',${ST.curRule})">📖 Baca Materi Lagi</button><button class="b bo" onclick="startRuleQuiz()">⟳ Ulangi Pilihan Ganda</button><button class="b bgh" onclick="exitSec()">← Kembali</button>`;
  }
  show('res');
}

// ============================================================
// ESSAY
// ============================================================
function startEssay(sId){
  ST.curSec=sId;ST.essIdx=0;ST.essRes=[];
  renderEssQ();show('ess');
}
function renderEssQ(){
  const sec=SECS.find(s=>s.id===ST.curSec);
  const q=sec.essay[ST.essIdx];
  const tot=sec.essay.length;
  document.getElementById('essLbl').textContent=`${sec.title} · Esai`;
  document.getElementById('essCtr').textContent=`${ST.essIdx+1} / ${tot}`;
  document.getElementById('essBar').style.width=`${((ST.essIdx+1)/tot)*100}%`;
  document.getElementById('essNum').textContent=`SOAL ESAI ${ST.essIdx+1} DARI ${tot}`;
  document.getElementById('essQ').textContent=q.q;
  const ta=document.getElementById('essTa');ta.value='';
  ta.oninput=()=>{document.getElementById('essChr').textContent=ta.value.length+' karakter';document.getElementById('essBtn').disabled=ta.value.trim().length<80;};
  document.getElementById('essChr').textContent='0 karakter';
  document.getElementById('essBtn').disabled=true;
  document.getElementById('essBtn').textContent='Kirim Jawaban →';
  document.getElementById('essErr').classList.add('hi');
  document.getElementById('essWrite').classList.remove('hi');
  document.getElementById('essFB').classList.add('hi');
}
async function submitEssay(){
  const sec=SECS.find(s=>s.id===ST.curSec);
  const q=sec.essay[ST.essIdx];
  const ans=document.getElementById('essTa').value.trim();
  document.getElementById('essBtn').disabled=true;document.getElementById('essBtn').textContent='Memproses…';
  document.getElementById('essErr').classList.add('hi');
  document.getElementById('gOverlay').classList.add('on');
  try{
    const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,
        messages:[{role:"user",content:`Kamu adalah dosen kepelautan yang menguji mahasiswa Nautika POLIMARIN tentang COLREG. Nilai jawaban secara adil — yang penting PEMAHAMAN KONSEP yang benar, bukan hafalan kata per kata. Bahasa Indonesia diutamakan.

Pertanyaan: "${q.q}"
Poin kunci: ${q.kp.map((p,i)=>`${i+1}. ${p}`).join('; ')}
Jawaban mahasiswa: "${ans}"

Balas HANYA dengan JSON valid tanpa backticks: {"score":7,"passed":true,"summary":"...","strengths":"...","improvements":"...","correctPoints":["..."],"missedPoints":["..."]}`}]})});
    const data=await res.json();
    let txt=(data.content||[]).find(b=>b.type==="text")?.text||"{}";
    txt=txt.replace(/```json|```/g,"").trim();
    const js=txt.indexOf('{');const je=txt.lastIndexOf('}');if(js!==-1&&je!==-1)txt=txt.substring(js,je+1);
    const result=JSON.parse(txt);
    ST.essRes.push({...result,q:q.q,ans});
    renderEssFB(result,ans);
  }catch(e){
    document.getElementById('essErr').textContent="⚠️ Gagal menilai. Periksa koneksi internet dan coba lagi.";
    document.getElementById('essErr').classList.remove('hi');
    document.getElementById('essBtn').disabled=false;document.getElementById('essBtn').textContent='Coba Lagi →';
  }finally{document.getElementById('gOverlay').classList.remove('on');}
}
function renderEssFB(r,ans){
  const sec=SECS.find(s=>s.id===ST.curSec);
  const isLast=ST.essIdx===sec.essay.length-1;
  document.getElementById('fbCard').style.borderColor=r.passed?'rgba(34,197,94,.5)':'rgba(201,168,76,.4)';
  document.getElementById('fbEmo').textContent=r.passed?'🎓':'📖';
  document.getElementById('fbScore').textContent=r.score;
  document.getElementById('fbScore').style.color=r.passed?'var(--grn)':'var(--gold)';
  document.getElementById('fbPass').textContent=r.passed?'Lulus ✓':'Perlu Diperdalam';
  document.getElementById('fbPass').style.color=r.passed?'var(--grn)':'var(--gold)';
  document.getElementById('fbSum').textContent=r.summary;
  document.getElementById('fbStr').textContent=r.strengths;
  document.getElementById('fbImp').textContent=r.improvements;
  const kp=document.getElementById('fbKP');kp.innerHTML=
    (r.correctPoints||[]).map(p=>`<div style="display:flex;gap:7px;margin-bottom:5px;font-size:13px;color:var(--grn);"><span>✓</span><span>${p}</span></div>`).join('')+
    (r.missedPoints||[]).map(p=>`<div style="display:flex;gap:7px;margin-bottom:5px;font-size:13px;color:var(--mut2);"><span>○</span><span>${p}</span></div>`).join('');
  document.getElementById('fbAns').textContent=ans;
  document.getElementById('essNxt').textContent=isLast?'🏁 Selesaikan Bagian Ini →':'Soal Esai Berikutnya →';
  document.getElementById('essWrite').classList.add('hi');document.getElementById('essFB').classList.remove('hi');
}
function nextEssay(){
  const sec=SECS.find(s=>s.id===ST.curSec);
  const isLast=ST.essIdx===sec.essay.length-1;
  if(!isLast){ST.essIdx++;renderEssQ();return;}
  const sp=getSecP(ST.curSec);sp.essayDone=true;sp.complete=true;save();
  const ni=SECS.findIndex(s=>s.id===ST.curSec)+1;
  document.getElementById('doneTitle').textContent=`Bagian ${ST.curSec} Selesai!`;
  document.getElementById('doneSub').textContent=`${sec.full} · ${sec.rules}`;
  const avgMC=Object.values(sp.rules).filter(r=>r.score!==null).reduce((s,r,_,a)=>s+r.score/a.length,0);
  document.getElementById('doneMC').textContent=Math.round(avgMC)+'%';
  const avgEss=ST.essRes.length>0?Math.round(ST.essRes.reduce((s,r)=>s+(r.score||0),0)/ST.essRes.length*10)+'%':'—';
  document.getElementById('doneEss').textContent=avgEss;
  const nxtSec=ni<SECS.length?SECS[ni]:null;
  document.getElementById('doneUnlock').innerHTML=nxtSec
    ?`<div class="c" style="padding:14px;border-color:rgba(34,197,94,.4);margin-bottom:15px;"><div style="color:var(--grn);font-weight:700;margin-bottom:5px;">✅ Bagian ${ST.curSec} Selesai!</div><div style="font-size:14px;">Lanjut ke Bagian ${nxtSec.id}: ${nxtSec.ico} ${nxtSec.full}</div></div>`
    :`<div class="c" style="padding:20px;text-align:center;border-color:rgba(201,168,76,.4);margin-bottom:15px;"><div style="font-size:40px;margin-bottom:8px;">🎓</div><div style="font-family:'Cinzel',serif;color:var(--gold);font-size:16px;">COLREG MASTERY COMPLETE!</div></div>`;
  document.getElementById('doneActs').innerHTML=(nxtSec?`<button class="b bg" onclick="openSec('${nxtSec.id}')">Lanjut ke Bagian ${nxtSec.id} →</button>`:'')+`<button class="b bgh" onclick="goColreg()">← Kembali ke COLREG</button>`;
  show('done');
}

// ============================================================
// INIT
// ============================================================
if(load()){goSubj();}else{renderSaved();show('name');}
