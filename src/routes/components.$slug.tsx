import { useEffect, useState, useSyncExternalStore } from 'react'
import { createFileRoute, Link as RouterLink } from '@tanstack/react-router'

import { getComponentDef, getComponentExamples } from '@/data'
import type { ComponentExample } from '@/data'
import { Link } from '@/ui/link'

export const Route = createFileRoute('/components/$slug')({
  loader: ({ params }) => {
    const def = getComponentDef(params.slug)
    return { def, examples: getComponentExamples(params.slug) }
  },
  component: ComponentPage,
})

function ComponentPage() {
  const { def, examples } = Route.useLoaderData()
  const live = examples.filter((example) => example.demoSrc !== null)
  const linkOnly = examples.filter((example) => example.demoSrc === null)

  return (
    <div className="mx-auto w-full max-w-6xl px-6">
      <header className="pt-10">
        <p className="font-mono text-xs tracking-wider text-fg-muted uppercase">
          <RouterLink to="/components" className="hover:underline">
            Components
          </RouterLink>
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          {def.name}
        </h1>
        {def.aliases.length > 0 && (
          <p className="mt-3 text-sm text-fg-muted">
            <span className="font-medium text-fg">Also known as:</span>{' '}
            {def.aliases.join(', ')}
          </p>
        )}
        <p className="mt-3 max-w-2xl text-base text-fg-muted">
          {def.description}
        </p>
        <p className="mt-6 font-mono text-xs text-fg-muted">
          {examples.length} examples · {live.length} live
        </p>
      </header>

      <section className="grid grid-cols-1 gap-4 pt-8 pb-24 sm:grid-cols-2 lg:grid-cols-3">
        {live.map((example) => (
          <ExampleCard key={example.system.slug} example={example} />
        ))}
        {linkOnly.map((example) => (
          <ExampleCard key={example.system.slug} example={example} />
        ))}
        {examples.length === 0 && (
          <p className="col-span-full rounded-lg border p-6 text-fg-muted">
            No systems have been extracted for this component yet.
          </p>
        )}
      </section>
    </div>
  )
}

// The applied theme, read from the class starter-themes puts on <html>. Its
// useTheme() context doesn't re-render when a "system" preference resolves to
// dark on load, so the DOM class — kept correct by its pre-hydration script —
// is the source of truth. SSR snapshot is light; the client re-renders once.
function useSiteMode(): 'light' | 'dark' {
  return useSyncExternalStore(
    (onChange) => {
      const observer = new MutationObserver(onChange)
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class'],
      })
      return () => observer.disconnect()
    },
    () => (document.documentElement.classList.contains('dark') ? 'dark' : 'light'),
    () => 'light',
  )
}

function ExampleCard({ example }: { example: ComponentExample }) {
  const { system, entry, demoSrc } = example
  // Demos read ?mode= and apply their own system's dark mechanism; systems
  // without dark mode ignore it and stay light. The key remounts the frame so
  // the new document always loads (patching src alone can skip a reload).
  const mode = useSiteMode()
  // The theme is client-only knowledge (OS preference / stored choice), so the
  // SSR mode is a guess. Mount the frame only on the client, once the real
  // mode is known — otherwise the wrong-mode demo loads first and visibly
  // swaps. Until then the demo area is an empty theme-colored box.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  return (
    <article className="overflow-hidden rounded-lg border bg-bg">
      {/* Preview first; the info bar follows. */}
      {demoSrc ? (
        mounted ? (
          // Each demo is a standalone page built from the system's real
          // published package (pinned versions) — sandboxed so nothing leaks
          // either way.
          <iframe
            key={mode}
            src={`${demoSrc}?mode=${mode}`}
            title={`${system.name} ${entry.name} demo`}
            loading="lazy"
            sandbox="allow-scripts allow-same-origin"
            className="block w-full border-0 bg-white dark:bg-[#111]"
            style={{ height: entry.demo?.height ?? 130 }}
          />
        ) : (
          <div
            className="w-full bg-white dark:bg-[#111]"
            style={{ height: entry.demo?.height ?? 130 }}
          />
        )
      ) : (
        <div className="flex h-24 items-center justify-center text-xs text-fg-muted">
          No live demo yet
        </div>
      )}
      <footer className="border-t px-4 py-2.5">
        <div className="flex items-baseline justify-between gap-2">
          <RouterLink
            to="/systems/$slug"
            params={{ slug: system.slug }}
            className="truncate text-sm font-medium hover:underline"
          >
            {system.name}
          </RouterLink>
          {/* The system's own name for it, when it differs from ours. */}
          {entry.name !== system.name && (
            <span className="truncate font-mono text-xs text-fg-muted">
              {entry.name}
            </span>
          )}
        </div>
        <div className="mt-1 flex items-center justify-between">
          {entry.docsUrl ? (
            <Link href={entry.docsUrl} className="text-xs">
              docs ↗
            </Link>
          ) : (
            <span />
          )}
          <span className="font-mono text-[10px] text-fg-muted">
            {demoSrc ? 'live · pinned' : 'docs only'}
          </span>
        </div>
      </footer>
    </article>
  )
}
