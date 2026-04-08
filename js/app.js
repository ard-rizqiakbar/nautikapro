const SK='nautikapro_v2';
let ST={name:null,profiles:{},curSec:null,curRule:0,mcA:{},mcIdx:0,essIdx:0,essRes:[]};

function save(){try{const d=JSON.parse(localStorage.getItem(SK)||'{}');d.profiles=ST.profiles;d.last=ST.name;localStorage.setItem(SK,JSON.stringify(d));}catch(e){}}
function load(){try{const d=JSON.parse(localStorage.getItem(SK)||'{}');ST.profiles=d.profiles||{};const ln=d.last;if(ln&&ST.profiles[ln]){ST.name=ln;return true;}}catch(e){}return false;}

function getP(){
  if(!ST.profiles[ST.name]){
    ST.profiles[ST.name]={colreg:{}};
    SECS.forEach(s=>{
      ST.profiles[ST.name].colreg[s.id]={rules:{},essayDone:false,complete:false};
      s.ruleList.forEach((_,i)=>{ST.profiles[ST.name].colreg[s.id].rules[i]={read:false,score:null,pass:false};});
    });
  }
  return ST.profiles[ST.name];
}
function getRuP(sId,ri){const p=getP();return(p.colreg[sId]?.rules||{})[ri]||{read:false,score:null,pass:false};}
function setRuP(sId,ri,u){const p=getP();if(!p.colreg[sId].rules[ri])p.colreg[sId].rules[ri]={};Object.assign(p.colreg[sId].rules[ri],u);save();}
function getSecP(sId){return getP().colreg[sId]||{rules:{},essayDone:false,complete:false};}

// ============================================================
// SCREEN
// ============================================================
function show(id){document.querySelectorAll('.screen').forEach(s=>s.classList.remove('on'));const el=document.getElementById('sc-'+id);if(el){el.classList.add('on');window.scrollTo(0,0);}}

// ============================================================
// NAME
// ============================================================
function renderSaved(){
  const ns=Object.keys(ST.profiles);
  const wrap=document.getElementById('savedList');
  if(!ns.length){wrap.innerHTML='';return;}
  wrap.innerHTML=`<div style="font-size:11px;font-family:'Cinzel',serif;color:var(--mut);letter-spacing:1px;margin-bottom:10px;">ATAU PILIH PROFIL YANG ADA</div>`
    +ns.map(n=>{
      const p=ST.profiles[n];
      const done=SECS.filter(s=>p.colreg&&p.colreg[s.id]&&p.colreg[s.id].complete).length;
      return `<div class="pp" onclick="pickProfile('${n}')"><div style="width:30px;height:30px;border-radius:50%;background:var(--bg3);border:1px solid var(--bdr2);display:flex;align-items:center;justify-content:center;font-size:15px;">👤</div><div><div style="font-weight:700;font-size:14px;">${n}</div><div style="font-size:12px;color:var(--mut2);">COLREG: ${done}/6 bagian selesai</div></div></div>`;
    }).join('');
}
function doLogin(){const n=document.getElementById('nameInp').value.trim();if(!n)return;ST.name=n;getP();save();goSubj();}
function pickProfile(n){ST.name=n;save();goSubj();}
document.getElementById('nameInp').addEventListener('keydown',e=>{if(e.key==='Enter')doLogin();});

// ============================================================
// SUBJECTS
// ============================================================
function goSubj(){
  document.getElementById('greeting').textContent=`Halo, ${ST.name} 👋`;
  const g=document.getElementById('subjGrid');
  g.innerHTML=SUBJS.map(s=>{
    let clickAction='';
    if(s.on){if(s.href)clickAction=`window.location.href='${s.href}'`;else clickAction='goColreg()';}
    return `<div class="sc${s.on?'':' cs'}" onclick="${clickAction}">
      ${!s.on?`<div style="position:absolute;top:8px;right:8px;background:rgba(201,168,76,.15);color:var(--gold);border:1px solid rgba(201,168,76,.3);border-radius:10px;padding:2px 7px;font-size:10px;font-family:'Cinzel',serif;">Segera</div>`:''}
      <div style="font-size:28px;margin-bottom:7px;">${s.ico}</div>
      <div style="font-family:'Cinzel',serif;font-size:12px;color:${s.on?'var(--gold)':'var(--mut2)'};font-weight:700;margin-bottom:3px;">${s.n}</div>
      <div style="font-size:11px;color:var(--mut2);line-height:1.4;">${s.d}</div>
      ${s.on?`<div style="margin-top:9px;font-size:11px;color:${s.id==='colreg'?'var(--grn)':'var(--org)'};font-weight:700;">Tersedia →</div>`:''}
    </div>`;
  }).join('');
  show('subj');
}
function switchUser(){ST.name=null;renderSaved();document.getElementById('nameInp').value='';show('name');}
function toggleImport(){document.getElementById('importBox').classList.toggle('hi');}
function doExport(){
  const d={name:ST.name,progress:ST.profiles[ST.name]};
  const j=btoa(unescape(encodeURIComponent(JSON.stringify(d))));
  const el=document.createElement('textarea');el.value=j;document.body.appendChild(el);el.select();document.execCommand('copy');document.body.removeChild(el);
  alert('✅ Kode progress berhasil disalin!\n\nPaste di perangkat lain menggunakan fitur Import.');
}
function doImport(){
  try{const r=document.getElementById('importTxt').value.trim();const d=JSON.parse(decodeURIComponent(escape(atob(r))));ST.profiles[d.name]=d.progress;save();alert(`✅ Progress "${d.name}" berhasil diimport!`);document.getElementById('importBox').classList.add('hi');}
  catch(e){alert('❌ Kode tidak valid. Pastikan kode yang kamu paste benar.');}
}

// ============================================================
// COLREG HOME
// ============================================================
function goColreg(){
  const p=getP();
  const done=SECS.filter(s=>p.colreg[s.id]?.complete).length;
  const pct=Math.round((done/SECS.length)*100);
  document.getElementById('mainBar').style.width=pct+'%';
  document.getElementById('mainPct').textContent=`${done} dari ${SECS.length} bagian selesai (${pct}%)`;
  const sl=document.getElementById('secList');sl.innerHTML='';
  SECS.forEach((sec,si)=>{
    const sp=p.colreg[sec.id];
    const locked=false; // Semua section bisa dibuka bebas
    const allRuPassed=sec.ruleList.every((_,ri)=>getRuP(sec.id,ri).pass);
    const fillPct=sp.complete?100:allRuPassed?66:Math.round(Object.values(sp.rules).filter(r=>r.pass).length/sec.ruleList.length*50);
    const d=document.createElement('div');
    d.className='c';d.style.cssText=`padding:16px 18px;margin-bottom:10px;display:flex;align-items:center;gap:13px;cursor:pointer;border-color:${sp.complete?'rgba(34,197,94,.5)':sec.col+'44'};transition:all .2s;`;
    d.onclick=()=>openSec(sec.id);d.onmouseenter=()=>d.style.background='var(--bg3)';d.onmouseleave=()=>d.style.background='var(--bg2)';
    d.innerHTML=`<div style="width:42px;height:42px;border-radius:10px;background:${sec.col}22;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;">${sp.complete?'🏅':sec.ico}</div>
      <div style="flex:1;min-width:0;">
        <div style="display:flex;align-items:center;gap:7px;"><span style="font-family:'Cinzel',serif;font-size:12px;font-weight:700;color:${sp.complete?'var(--grn)':sec.col};">${sec.title}</span><span style="font-size:11px;color:var(--mut);">· ${sec.rules}</span></div>
        <div style="font-family:'Lora',serif;font-size:14px;margin-top:2px;">${sec.full}</div>
        <div style="height:3px;background:var(--bdr);border-radius:2px;margin-top:7px;overflow:hidden;"><div style="height:100%;width:${fillPct}%;background:${sp.complete?'var(--grn)':sec.col};border-radius:2px;transition:width .5s;"></div></div>
      </div>
      <div style="flex-shrink:0;font-size:11px;font-weight:700;color:${sp.complete?'var(--grn)':sec.col};">${sp.complete?'SELESAI ✓':sp.complete||allRuPassed?'Esai →':'BUKA →'}</div>`;
    sl.appendChild(d);
  });
  show('colreg');
}

// ============================================================
// SECTION DETAIL
// ============================================================
function openSec(sId){
  ST.curSec=sId;
  const sec=SECS.find(s=>s.id===sId);
  const sp=getSecP(sId);
  document.getElementById('secLbl').textContent=`${sec.title} · COLREG`;
  document.getElementById('secLbl').style.color=sec.col;
  document.getElementById('secSub').textContent=sec.full;
  document.getElementById('secIco').textContent=sec.ico;
  document.getElementById('secDesc').textContent=sec.desc;
  const rc=document.getElementById('ruleCards');rc.innerHTML='';
  sec.ruleList.forEach((rule,ri)=>{
    const rp=getRuP(sId,ri);
    const locked=false; // Semua materi bisa dibuka bebas
    const card=document.createElement('div');
    card.className='c';card.style.cssText=`padding:15px 16px;margin-bottom:9px;display:flex;align-items:center;gap:12px;cursor:pointer;border-color:${rp.pass?'rgba(34,197,94,.5)':sec.col+'44'};transition:all .2s;`;
    card.onclick=()=>openRule(sId,ri);card.onmouseenter=()=>card.style.background='var(--bg3)';card.onmouseleave=()=>card.style.background='var(--bg2)';
    card.innerHTML=`<div style="width:36px;height:36px;border-radius:9px;background:${rp.pass?'var(--grn)':sec.col+'22'};display:flex;align-items:center;justify-content:center;font-family:'Cinzel',serif;font-size:12px;font-weight:700;color:${rp.pass?'#fff':sec.col};flex-shrink:0;">${rp.pass?'✓':rule.num}</div>
      <div style="flex:1;"><div style="font-family:'Cinzel',serif;font-size:11px;color:${rp.pass?'var(--grn)':sec.col};font-weight:700;">Aturan ${rule.num}</div>
      <div style="font-size:14px;margin-top:2px;">${rule.title}</div>
      ${rp.score!==null?`<div style="font-size:12px;color:${rp.pass?'var(--grn)':'var(--red)'};margin-top:2px;">Skor PG: ${rp.score}%</div>`:''}
      </div>
      <div style="font-size:12px;font-weight:700;color:${rp.pass?'var(--grn)':sec.col};">${rp.pass?'Lulus ✓':rp.score!==null?'Ulangi':'Mulai →'}</div>`;
    rc.appendChild(card);
  });
  // Essay zone
  const ez=document.getElementById('essayZone');
  const allPass=sec.ruleList.every((_,ri)=>getRuP(sId,ri).pass);
  if(sp.essayDone){
    ez.innerHTML=`<div class="c" style="padding:15px;text-align:center;border-color:rgba(34,197,94,.4);"><div style="color:var(--grn);font-weight:700;margin-bottom:6px;">✅ Esai Bagian ${sId} Selesai</div><button class="b bgh" style="padding:9px;font-size:13px;" onclick="startEssay('${sId}')">Ulangi Esai</button></div>`;
  } else if(allPass){
    ez.innerHTML=`<div class="c" style="padding:16px;border-color:rgba(201,168,76,.4);"><div style="font-family:'Cinzel',serif;font-size:13px;color:var(--gold);margin-bottom:7px;">✍️ Esai Tersedia!</div><div style="font-size:14px;margin-bottom:13px;">Semua aturan di Bagian ${sId} sudah lulus. Kerjakan Esai untuk menyelesaikan bagian ini!</div><button class="b bg" onclick="startEssay('${sId}')">Mulai Esai Bagian ${sId} →</button></div>`;
  } else {
    const rem=sec.ruleList.filter((_,ri)=>!getRuP(sId,ri).pass).length;
    ez.innerHTML=`<div style="text-align:center;padding:12px;font-size:13px;color:var(--mut2);">🔒 Esai terbuka setelah semua ${sec.ruleList.length} aturan lulus PG (${rem} lagi)</div>`;
  }
  show('sec');
}
function backSec(){openSec(ST.curSec);}
function exitSec(){openSec(ST.curSec);}
