// 漢字の直後にある助詞（の・を・に・が・と）を小さくして、文字にメリハリをつける。
// 「ひととき」のように平仮名が続く部分の「と」は対象外。
const PARTICLE = /(?<=[\u4e00-\u9fff])([のをにがと])/g;

export default function SmallParticles({ text }) {
  const out = [];
  let last = 0;
  for (const m of text.matchAll(PARTICLE)) {
    if (m.index > last) out.push(text.slice(last, m.index));
    out.push(
      <span key={m.index} className="josi-small">
        {m[1]}
      </span>
    );
    last = m.index + 1;
  }
  if (last < text.length) out.push(text.slice(last));
  return <>{out}</>;
}
