// 写真の表示 or 仮表示の枠。base が空のあいだは枠だけを出す（TODO: lib/siteConfig.js の IMAGES に写真のパスを入れる）。
// base … /images/hero/home-hero のような拡張子・幅サフィックスなしのパス
// widths … srcset の幅。実ファイルと必ず一致させること
export default function Photo({
  base,
  widths = [640, 1024],
  className,
  style,
  eager = false,
  label,
}) {
  if (!base) {
    return (
      <div className="photo-placeholder" role="img" aria-label="写真準備中">
        <span className="photo-placeholder-label">{label}</span>
      </div>
    );
  }
  const srcSet = widths.map((w) => `${base}-${w}.webp ${w}w`).join(", ");
  return (
    <img
      src={`${base}.webp`}
      srcSet={srcSet}
      sizes="100vw"
      alt=""
      className={className}
      style={style}
      loading={eager ? undefined : "lazy"}
      fetchPriority={eager ? "high" : undefined}
      decoding="async"
    />
  );
}
