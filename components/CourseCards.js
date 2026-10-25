import Link from "next/link";
import { COURSES, COURSE_FLOW } from "../lib/siteConfig";

// コースカード（トップ・/menu で共用）。group で「通年」「期間限定」を出し分ける。
// featured のコース（おつまみコース）は全幅で目立たせ、
// 「コース → アラカルト追加」という定番の流れを添える。
// compact=true（トップ用）では内容の内訳を省く。
export default function CourseCards({ group = "regular", withCta = false, compact = false }) {
  const courses = COURSES.filter((c) => c.group === group);
  if (courses.length === 0) return null;

  return (
    <div className="course-grid">
      {courses.map((course) => (
        <article
          key={course.slug}
          className={`course-card${course.featured ? " course-card--featured" : ""}`}
        >
          {course.featured && <p className="course-badge">まずはこちらから</p>}
          {course.season && <p className="course-season">{course.season}</p>}
          <header className="course-card-head">
            <h3 className="course-card-name">
              <span className="course-no">{course.no}</span>
              {course.name}
              {course.tag && <span className="course-card-reading">{course.tag}</span>}
            </h3>
            <p className="course-card-price">
              {course.price}
              <span className="course-price-tax">税込</span>
              <span className="course-price-base">本体価格 {course.basePrice}</span>
            </p>
          </header>
          {course.condition && <p className="course-card-duration">※{course.condition}</p>}
          {course.mainIngredients && (
            <p className="course-card-duration">主要食材：{course.mainIngredients}</p>
          )}
          <p className="course-card-lead">{course.lead}</p>
          {!compact && course.items.length > 0 && (
            <ul className="course-card-items">
              {course.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
          {course.note && (
            <div className="course-flow-box">
              <ol className="course-flow" aria-label="定番の楽しみ方">
                {COURSE_FLOW.map((step) => (
                  <li key={step.label} className="course-flow-step">
                    <span className="course-flow-label">{step.label}</span>
                    {step.text}
                  </li>
                ))}
              </ol>
              <p className="course-flow-note">{course.note}</p>
            </div>
          )}
          {withCta && (
            <p className="course-card-cta">
              <Link href="/contact" className="btn btn--primary">
                ご予約・ご相談
              </Link>
            </p>
          )}
        </article>
      ))}
    </div>
  );
}
