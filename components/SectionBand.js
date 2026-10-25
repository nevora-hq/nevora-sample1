import Photo from "./Photo";

// セクションの区切りに挟むfull-bleed(画面幅いっぱい)の画像バンド。
// base が空のあいだは仮表示の枠になる（lib/siteConfig.js の IMAGES.band）。
export default function SectionBand({ base, widths, objectPosition, children }) {
  return (
    <div className="section-band">
      <Photo
        base={base}
        widths={widths}
        className="section-band-img"
        style={objectPosition ? { objectPosition } : undefined}
        label="帯写真（推奨 1600×520px）"
      />
      {children ? (
        <>
          <div className="section-band-scrim" aria-hidden="true" />
          <div className="section-band-overlay">
            <div className="container container--wide">{children}</div>
          </div>
        </>
      ) : null}
    </div>
  );
}
