import { ExternalLink, Heart, Zap } from 'lucide-react';
import {
  developer,
  engineeringHighlights,
  heroStats,
  journey,
  projectLinks,
  techStack,
  whyTaskFlow,
} from '../config/developer';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useCountUp } from '../hooks/useCountUp';
import { HeaderDecor } from '../components/ui/HeaderDecor';
import { Code2 } from 'lucide-react';

/** Animated trust-signal metric (reuses the dashboard's count-up hook). */
function HeroStatValue({ value, suffix }: { value: number; suffix?: string }) {
  const animated = useCountUp(value);
  return (
    <span className="font-display text-2xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight tabular-nums">
      {animated}
      {suffix}
    </span>
  );
}

/** Section heading with a short supporting description. */
function SectionHeading({ id, title, desc }: { id: string; title: string; desc?: string }) {
  return (
    <div className="mb-5">
      <h3 id={id} className="text-lg font-bold text-gray-900 dark:text-gray-100">{title}</h3>
      {desc && (
        <p className="text-sm text-gray-500 dark:text-gray-300 mt-1 max-w-2xl">{desc}</p>
      )}
    </div>
  );
}

export function DeveloperPage() {
  useDocumentTitle('Developer');

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* ── 1. Developer Hero ─────────────────────────────────── */}
      <section
        aria-labelledby="developer-heading"
        className="relative overflow-hidden glass rounded-2xl p-8 animate-fade-up"
      >
        <HeaderDecor icon={<Code2 className="h-44 w-44" />} />
        <div className="relative flex flex-col sm:flex-row sm:items-start gap-6">
          <div
            className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-sky-400 to-indigo-500 text-white text-2xl font-bold shadow-lg shadow-sky-500/30 animate-zoom-in"
            aria-hidden="true"
          >
            {developer.avatarInitials}
          </div>
          <div className="min-w-0">
            <h2
              id="developer-heading"
              className="text-2xl font-bold text-gray-900 dark:text-gray-100 animate-fade-up"
              style={{ animationDelay: '60ms' }}
            >
              {developer.name}
            </h2>
            <p
              className="text-sm font-medium text-sky-700 dark:text-sky-300 mt-0.5 animate-fade-up"
              style={{ animationDelay: '120ms' }}
            >
              {developer.role}
            </p>
            <p
              className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mt-3 animate-fade-up"
              style={{ animationDelay: '180ms' }}
            >
              {developer.intro}
            </p>
            <ul
              className="flex flex-wrap gap-3 mt-5 list-none p-0"
              aria-label="Developer profiles"
            >
              {developer.socialLinks.map((link, i) => (
                <li key={link.label} className="animate-fade-up" style={{ animationDelay: `${240 + i * 60}ms` }}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 glass-input rounded-xl hover:bg-white/70 dark:hover:bg-white/15 hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <link.icon className="h-4 w-4" aria-hidden="true" />
                    {link.label}
                    <ExternalLink className="h-3 w-3 text-gray-400" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>

            {/* Verifiable trust signals (counts come from the repo itself) */}
            <dl
              className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-gray-900/5 dark:border-white/10"
              aria-label="Project metrics"
            >
              {heroStats.map((stat, i) => (
                <div
                  key={stat.label}
                  className="flex flex-col animate-fade-up"
                  style={{ animationDelay: `${300 + i * 60}ms` }}
                >
                  <dd className="order-1">
                    <HeroStatValue value={stat.value} suffix={stat.suffix} />
                  </dd>
                  <dt className="order-2 text-xs text-gray-500 dark:text-gray-300 mt-1">
                    {stat.label}
                  </dt>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* ── 2. About the Developer ────────────────────────────── */}
      <section
        aria-labelledby="about-developer-heading"
        className="glass rounded-2xl p-6 animate-fade-up"
        style={{ animationDelay: '60ms' }}
      >
        <h3
          id="about-developer-heading"
          className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3"
        >
          About the Developer
        </h3>
        <div className="space-y-3">
          {developer.about.map((paragraph) => (
            <p
              key={paragraph.slice(0, 32)}
              className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed"
            >
              {paragraph}
            </p>
          ))}
        </div>
      </section>

      {/* ── 3. Technology Stack ───────────────────────────────── */}
      <section
        aria-labelledby="tech-stack-heading"
        className="animate-fade-up"
        style={{ animationDelay: '120ms' }}
      >
        <SectionHeading
          id="tech-stack-heading"
          title="Technology Stack"
          desc="Every technology below is used in this repository today — nothing aspirational."
        />
        {techStack.map((category, ci) => (
          <div
            key={category.name}
            className="glass rounded-2xl p-6 mb-4 last:mb-0 animate-fade-up"
            style={{ animationDelay: `${120 + ci * 60}ms` }}
          >
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <category.icon className="h-4 w-4 text-sky-600 dark:text-sky-400" aria-hidden="true" />
              {category.name}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {category.items.map((tech) => (
                <div
                  key={tech.name}
                  className="rounded-xl glass-input px-4 py-3 glass-hover hover:-translate-y-0.5 transition-all duration-200"
                >
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <tech.icon
                      className="h-4 w-4 text-gray-400 dark:text-gray-400 shrink-0 transition-transform duration-200 group-hover:scale-110"
                      aria-hidden="true"
                    />
                    {tech.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-300 mt-1">{tech.desc}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* ── 4. Why TaskFlow Exists ────────────────────────────── */}
      <section
        aria-labelledby="why-heading"
        className="glass rounded-2xl p-6 animate-fade-up"
        style={{ animationDelay: '180ms' }}
      >
        <h3
          id="why-heading"
          className="text-lg font-bold text-gray-900 dark:text-gray-100"
        >
          Why TaskFlow Exists
        </h3>
        {/* Storytelling narrative — plain prose, per content research */}
        <div className="space-y-3 mt-3 max-w-2xl">
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            {whyTaskFlow.intro}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            Every layer had a reason. The API needed real filtering, pagination, and search — so
            it got them. Validation had to fail loudly and safely — so Pydantic schemas reject bad
            input at the boundary. Data had to survive restarts — so SQLAlchemy models ship with
            Alembic migrations. And the interface had to feel as considered as the backend — so the
            frontend is type-safe, responsive, and tested, with the same design system end to end.
          </p>
        </div>
        <ul className="space-y-2.5 mt-5" aria-label="Engineering motivations">
          {whyTaskFlow.motivations.map((m) => (
            <li
              key={m}
              className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300"
            >
              <Zap
                className="h-4 w-4 mt-0.5 text-sky-500 dark:text-sky-400 shrink-0"
                aria-hidden="true"
              />
              {m}
            </li>
          ))}
        </ul>
      </section>

      {/* ── 5. The Journey (real milestones) ──────────────────── */}
      <section
        aria-labelledby="journey-heading"
        className="animate-fade-up"
        style={{ animationDelay: '220ms' }}
      >
        <SectionHeading
          id="journey-heading"
          title="The Journey"
          desc="Milestones from the project's git history — how TaskFlow grew from a skeleton into a deployed product."
        />
        <ol className="relative ml-3 border-l border-gray-900/10 dark:border-white/10 space-y-6">
          {journey.map((milestone, i) => (
            <li
              key={milestone.title}
              className="relative pl-6 animate-fade-up"
              style={{ animationDelay: `${220 + i * 60}ms` }}
            >
              <span
                className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 ring-4 ring-white/70 dark:ring-slate-900/70"
                aria-hidden="true"
              />
              <p className="text-xs font-medium text-sky-700 dark:text-sky-300">{milestone.date}</p>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mt-0.5">
                {milestone.title}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mt-1">
                {milestone.desc}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* ── 6. Engineering Highlights ─────────────────────────── */}
      <section
        aria-labelledby="highlights-heading"
        className="animate-fade-up"
        style={{ animationDelay: '260ms' }}
      >
        <SectionHeading
          id="highlights-heading"
          title="Engineering Highlights"
          desc="Engineering work that went into TaskFlow, as it exists in the codebase today."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {engineeringHighlights.map((h, i) => (
            <article
              key={h.title}
              className="glass rounded-2xl p-5 animate-fade-up transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-sky-500/10"
              style={{ animationDelay: `${260 + i * 60}ms` }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400/15 to-indigo-500/15 text-sky-600 dark:text-sky-400 transition-transform duration-200">
                  <h.icon className="h-4.5 w-4.5" aria-hidden="true" />
                </div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {h.title}
                </h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                {h.desc}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* ── 7. Project Links ──────────────────────────────────── */}
      <section
        aria-labelledby="links-heading"
        className="animate-fade-up"
        style={{ animationDelay: '320ms' }}
      >
        <SectionHeading
          id="links-heading"
          title="Project Links"
          desc="Everything opens in a new tab."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {projectLinks.map((link, i) => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group glass rounded-2xl p-5 animate-fade-up transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-sky-500/10"
              style={{ animationDelay: `${320 + i * 60}ms` }}
            >
              <span className="flex items-center gap-3">
                <link.icon
                  className="h-4.5 w-4.5 text-sky-600 dark:text-sky-400 transition-transform duration-200 group-hover:scale-110"
                  aria-hidden="true"
                />
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {link.label}
                </span>
                <ExternalLink
                  className="h-3.5 w-3.5 ml-auto text-gray-400 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </span>
              <span className="block text-xs text-gray-500 dark:text-gray-300 mt-1.5">
                {link.desc}
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* ── 8. Footer ─────────────────────────────────────────── */}
      <footer
        className="text-center py-4 animate-fade-up"
        style={{ animationDelay: '380ms' }}
      >
        <p className="text-xs text-gray-500 dark:text-gray-300 flex items-center justify-center gap-1.5 flex-wrap">
          TaskFlow — designed and developed by {developer.name}, built with
          <Heart className="h-3.5 w-3.5 text-sky-500 dark:text-sky-400" aria-hidden="true" />
          using React, TypeScript &amp; FastAPI
        </p>
      </footer>
    </div>
  );
}
