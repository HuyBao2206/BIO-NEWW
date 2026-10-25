// Kiểm tra dữ liệu tarot: chạy `node scripts/check-tarot.mjs` từ thư mục gốc repo.
const { TAROT } = await import(new URL('../assets/js/data/tarot.js', import.meta.url));
const errs = [];
if (TAROT.length !== 78) errs.push(`Số lá: ${TAROT.length} (cần 78)`);
const ids = new Set();
const top = ['id','nameEn','nameVi','arcana','suit','number','keywords','upright','reversed','symbol'];
const sub = ['message','love','work','advice'];
const counts = { major: 0, wands: 0, cups: 0, swords: 0, pentacles: 0 };
for (const c of TAROT) {
  if (ids.has(c.id)) errs.push(`Trùng id: ${c.id}`); ids.add(c.id);
  for (const k of top) if (!(k in c)) errs.push(`${c.id}: thiếu ${k}`);
  for (const k of ['id','nameEn','nameVi','symbol']) if (typeof c[k] !== 'string' || !c[k].trim()) errs.push(`${c.id}: ${k} rỗng`);
  if (!/^[a-z0-9-]+$/.test(c.id)) errs.push(`${c.id}: id không hợp lệ cho tên file`);
  if (!Array.isArray(c.keywords) || c.keywords.length < 3 || c.keywords.length > 5) errs.push(`${c.id}: keywords phải 3–5`);
  for (const side of ['upright','reversed']) for (const k of sub) if (typeof c[side]?.[k] !== 'string' || !c[side][k].trim()) errs.push(`${c.id}: thiếu ${side}.${k}`);
  if (c.arcana === 'major') { counts.major++; if (c.suit !== null || c.number < 0 || c.number > 21) errs.push(`${c.id}: major sai suit/number`); }
  else if (c.arcana === 'minor') { counts[c.suit]++; if (c.number < 1 || c.number > 14) errs.push(`${c.id}: number sai`); }
  else errs.push(`${c.id}: arcana sai`);
}
const majNums = TAROT.filter(c=>c.arcana==='major').map(c=>c.number).sort((a,b)=>a-b).join(',');
if (majNums !== Array.from({length:22},(_,i)=>i).join(',')) errs.push('Major không đủ 0–21');
for (const s of ['wands','cups','swords','pentacles']) { const n = TAROT.filter(c=>c.suit===s).map(c=>c.number).sort((a,b)=>a-b).join(','); if (n !== Array.from({length:14},(_,i)=>i+1).join(',')) errs.push(`${s} không đủ 1–14`); }
const banned = /(sẽ chết|bệnh nặng|ung thư|trúng số|phá sản|kiện tụng|ra toà|toà án|giàu to|mất tiền|kiếm được .* tiền)/i;
for (const c of TAROT) for (const side of ['upright','reversed']) for (const k of sub) if (banned.test(c[side][k])) errs.push(`${c.id}.${side}.${k}: có cụm từ dự đoán nhạy cảm`);
console.log('Đếm:', JSON.stringify(counts), '· tổng', TAROT.length);
console.log(errs.length ? 'LỖI:\n' + errs.join('\n') : 'OK — đủ 78 lá, id không trùng, không lá nào thiếu trường.');
process.exit(errs.length ? 1 : 0);
