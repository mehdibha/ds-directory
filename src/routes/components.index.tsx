import { useMemo, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'

import { dataIndex, getComponentExamples } from '@/data'
import { SearchField } from '@/ui/search-field'

export const Route = createFileRoute('/components/')({
  component: ComponentsIndex,
})

// Components with examples first (most examples on top), then the rest.
const components = [...dataIndex.componentsCatalog]
  .map((def) => ({ def, examples: getComponentExamples(def.slug) }))
  .sort(
    (a, b) =>
      b.examples.length - a.examples.length ||
      a.def.name.localeCompare(b.def.name),
  )

const totalExamples = components.reduce(
  (sum, { examples }) => sum + examples.length,
  0,
)

function ComponentsIndex() {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return components
    return components.filter(({ def }) =>
      `${def.name} ${def.aliases.join(' ')}`.toLowerCase().includes(q),
    )
  }, [query])

  return (
    <div className="mx-auto w-full max-w-4xl px-6">
      <section className="py-12 sm:py-16">
        <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          Components, across systems.
        </h1>
        <p className="mt-4 max-w-xl text-base text-balance text-fg-muted">
          The same component, as every design system ships it — live, from
          each system&apos;s real published code.
        </p>
        <p className="mt-8 font-mono text-xs text-fg-muted">
          {components.length} components · {totalExamples} examples across
          systems
        </p>
      </section>

      <section className="pb-24">
        <SearchField
          aria-label="Search components"
          placeholder="Search components…"
          value={query}
          onChange={setQuery}
        />
        <ul className="mt-4 divide-y divide-border">
          {filtered.map(({ def, examples }) => {
            const hasExamples = examples.length > 0
            return (
              <li key={def.slug}>
                <Link
                  to="/components/$slug"
                  params={{ slug: def.slug }}
                  className="group flex items-baseline gap-3 py-4"
                  disabled={!hasExamples}
                >
                  <span
                    className={
                      hasExamples
                        ? 'font-medium group-hover:underline'
                        : 'font-medium text-fg-disabled'
                    }
                  >
                    {def.name}
                  </span>
                  {def.aliases.length > 0 && (
                    <span className="hidden truncate text-xs text-fg-muted sm:inline">
                      {def.aliases.join(' · ')}
                    </span>
                  )}
                  <span className="ml-auto shrink-0 font-mono text-xs text-fg-muted">
                    {hasExamples ? `${examples.length} examples` : 'planned'}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
        {filtered.length === 0 && (
          <p className="mt-8 text-sm text-fg-muted">
            No components match your search.
          </p>
        )}
      </section>
    </div>
  )
}
