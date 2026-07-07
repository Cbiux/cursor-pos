"use client";

import type { ReactNode } from "react";
import { BookOpen, ExternalLink, Printer } from "lucide-react";

import { useLocale } from "@/lib/i18n/locale-context";

const REPO_URL = "https://github.com/cursorcommunityled/cursor-pos";

function DocsSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
      <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">{title}</h3>
      {children}
    </section>
  );
}

function DocsList({ items }: { items: string[] }) {
  return (
    <ul className="mt-4 space-y-2">
      {items.map((item) => (
        <li key={item} className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          • {item}
        </li>
      ))}
    </ul>
  );
}

function DocsSteps({ steps }: { steps: string[] }) {
  return (
    <ol className="mt-4 space-y-3">
      {steps.map((step, index) => (
        <li key={step} className="flex gap-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900">
            {index + 1}
          </span>
          <span>{step}</span>
        </li>
      ))}
    </ol>
  );
}

export function DocsContent() {
  const { t } = useLocale();

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-zinc-100 p-3 dark:bg-zinc-800">
            <Printer className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
              {t.docs.printerTitle}
            </h2>
            <p className="mt-1 text-sm font-medium text-zinc-800 dark:text-zinc-200">
              {t.docs.printerModel}
            </p>
            <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              {t.docs.printerSpecs}
            </p>
          </div>
        </div>
      </section>

      <DocsSection title={t.docs.compatibilityTitle}>
        <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          {t.docs.compatibilityBody}
        </p>
      </DocsSection>

      <DocsSection title={t.docs.connectTitle}>
        <DocsSteps steps={t.docs.connectSteps} />
      </DocsSection>

      <DocsSection title={t.docs.modesTitle}>
        <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{t.docs.modesIntro}</p>
        <DocsList items={t.docs.modes} />
      </DocsSection>

      <DocsSection title={t.docs.eventTicketTitle}>
        <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          {t.docs.eventTicketBody}
        </p>
        <DocsSteps steps={t.docs.eventTicketSteps} />
      </DocsSection>

      <DocsSection title={t.docs.lumaTitle}>
        <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{t.docs.lumaBody}</p>
        <DocsSteps steps={t.docs.lumaSteps} />
        <p className="mt-4 text-sm font-medium text-zinc-800 dark:text-zinc-200">
          {t.docs.lumaBadgeTitle}
        </p>
        <DocsList items={t.docs.lumaBadgeSteps} />
        <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
          {t.docs.lumaNote}
        </p>
      </DocsSection>

      <DocsSection title={t.docs.creditsTitle}>
        <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{t.docs.creditsBody}</p>
        <DocsSteps steps={t.docs.creditsSteps} />
        <p className="mt-4 text-sm font-medium text-zinc-800 dark:text-zinc-200">
          {t.docs.creditsCsvTitle}
        </p>
        <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{t.docs.creditsCsvHint}</p>
        <DocsList items={t.docs.creditsCsvColumns} />
      </DocsSection>

      <DocsSection title={t.docs.lumaSetupTitle}>
        <DocsSteps steps={t.docs.lumaSetupSteps} />
        <p className="mt-4 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{t.docs.lumaSetupNote}</p>
      </DocsSection>

      <section className="grid gap-6 md:grid-cols-2">
        <DocsSection title={t.docs.featuresTitle}>
          <DocsList items={t.docs.features} />
        </DocsSection>
        <DocsSection title={t.docs.requirementsTitle}>
          <DocsList items={t.docs.requirements} />
        </DocsSection>
      </section>

      <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-zinc-100 p-3 dark:bg-zinc-800">
            <ExternalLink className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">{t.docs.repoTitle}</h3>
            <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{t.docs.repoBody}</p>
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-4 transition hover:decoration-zinc-900 dark:text-zinc-50 dark:decoration-zinc-600 dark:hover:decoration-zinc-200"
            >
              {t.docs.repoLinkLabel}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

export function DocsPageHeader() {
  const { t } = useLocale();

  return (
    <div className="mb-8">
      <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
        <BookOpen className="h-3.5 w-3.5" />
        {t.docs.title}
      </div>
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        {t.docs.pageTitle}
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
        {t.docs.pageSubtitle}
      </p>
    </div>
  );
}
