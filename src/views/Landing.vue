<template>
  <div
    ref="rootEl"
    class="landing relative min-h-screen overflow-x-hidden bg-slate-950 text-slate-100 antialiased"
  >
    <!-- Ambient gradient backdrop -->
    <div class="pointer-events-none absolute inset-0" aria-hidden="true">
      <div class="absolute left-1/2 top-[-20%] h-[760px] w-[760px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(56,189,248,0.25),transparent)] blur-3xl sm:h-[900px] sm:w-[900px]" />
      <div class="absolute right-[-15%] top-[40%] h-[640px] w-[640px] rounded-full bg-[radial-gradient(closest-side,rgba(168,85,247,0.22),transparent)] blur-3xl sm:h-[820px] sm:w-[820px]" />
      <div class="absolute inset-0 bg-[linear-gradient(to_bottom,#020617_0%,#0b1220_60%,#020617_100%)]" />
      <div class="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:32px_32px] opacity-30" />
    </div>

    <!-- Nav -->
    <header
      class="relative z-40 transition-colors duration-200"
      :class="navScrolled ? 'bg-slate-950/80 backdrop-blur-xl shadow-[0_1px_0_rgba(255,255,255,0.06)]' : ''"
    >
      <div class="mx-auto flex h-16 max-w-[1200px] items-center gap-4 px-5 sm:px-8">
        <RouterLink to="/welcome" class="flex items-center gap-2.5">
          <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10">
            <img src="/logo-mark.svg" :alt="brand" class="h-6 w-6" />
          </span>
          <span class="text-[15px] font-bold tracking-tight">{{ brand }}</span>
        </RouterLink>
        <nav class="ml-auto hidden items-center gap-1 md:flex" aria-label="Sections">
          <a
            v-for="item in navItems"
            :key="item.id"
            :href="`#${item.id}`"
            class="rounded-lg px-3 py-2 text-[13px] font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
          >
            {{ item.label }}
          </a>
        </nav>
        <div class="ml-auto flex items-center gap-2 md:ml-0">
          <RouterLink
            to="/login"
            class="hidden rounded-lg px-3 py-2 text-[13px] font-semibold text-slate-200 transition hover:bg-white/5 hover:text-white sm:inline-flex"
          >
            Sign in
          </RouterLink>
          <RouterLink
            to="/register"
            class="group inline-flex items-center gap-1.5 rounded-lg bg-white px-3.5 py-2 text-[13px] font-semibold text-slate-900 shadow-[0_6px_20px_rgba(56,189,248,0.18)] transition hover:bg-slate-100 sm:px-4"
          >
            Get started
            <svg class="h-3 w-3 transition group-hover:translate-x-0.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </RouterLink>
        </div>
      </div>
    </header>

    <!-- Hero -->
    <section class="relative z-10 px-5 pt-10 sm:px-8 md:pt-16 lg:pt-24" aria-labelledby="hero-title">
      <div class="mx-auto max-w-[1200px]">
        <div class="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-10">
          <div class="lg:col-span-6" data-reveal>
            <span class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-300">
              <span class="h-1.5 w-1.5 rounded-full bg-sky-400" aria-hidden="true" />
              New · Real-time notification center
            </span>
            <h1
              id="hero-title"
              class="mt-5 text-[2.15rem] font-bold leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-[4rem]"
            >
              Your employee workspace,
              <span class="bg-gradient-to-r from-sky-300 via-indigo-300 to-fuchsia-300 bg-clip-text text-transparent">
                tuned for focus.
              </span>
            </h1>
            <p class="mt-5 max-w-xl text-[15px] leading-relaxed text-slate-300 sm:text-base md:text-lg">
              Payroll, time, tasks, leaves and HR — one calm workspace with a notification stream that
              finally respects your attention. Everything you're about to see runs in a modern SPA with
              zero build-time waste.
            </p>
            <div class="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <RouterLink
                to="/login"
                class="accent-gradient accent-focus accent-shadow inline-flex h-12 items-center justify-center gap-2 rounded-xl px-6 text-[14px] font-semibold transition hover:brightness-110"
              >
                Try the live demo
                <svg class="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </RouterLink>
              <a
                href="#features"
                class="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-5 text-[14px] font-semibold text-slate-200 transition hover:bg-white/[0.06]"
              >
                Tour the product
              </a>
            </div>

            <dl class="mt-10 grid max-w-xl grid-cols-3 gap-3 sm:gap-4">
              <div
                v-for="s in heroStats"
                :key="s.label"
                class="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3 backdrop-blur-sm sm:px-4 sm:py-4"
                data-reveal
              >
                <dt class="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400 sm:text-[11px]">
                  {{ s.label }}
                </dt>
                <dd class="mt-1 text-lg font-semibold tracking-tight text-white sm:text-xl">
                  {{ s.value }}
                </dd>
              </div>
            </dl>
          </div>

          <div class="relative lg:col-span-6" data-reveal>
            <AppMockup />
          </div>
        </div>
      </div>
    </section>

    <!-- Trust strip -->
    <section class="relative z-10 mt-20 px-5 sm:mt-24 sm:px-8" aria-label="Trusted by">
      <div class="mx-auto max-w-[1100px]">
        <p class="text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
          Built for teams that ship
        </p>
        <div class="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
          <div
            v-for="badge in badges"
            :key="badge"
            class="flex h-12 items-center justify-center rounded-xl border border-white/5 bg-white/[0.02] text-[13px] font-semibold tracking-tight text-slate-300 transition hover:border-white/10 hover:text-white"
            data-reveal
          >
            {{ badge }}
          </div>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section id="features" class="relative z-10 mt-24 px-5 sm:mt-32 sm:px-8" aria-labelledby="features-title">
      <div class="mx-auto max-w-[1200px]">
        <div class="max-w-2xl" data-reveal>
          <span class="text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-300">
            Features
          </span>
          <h2
            id="features-title"
            class="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl"
          >
            A clean home for everything your week needs.
          </h2>
          <p class="mt-4 text-[15px] leading-relaxed text-slate-300 md:text-base">
            Fewer tabs, fewer pings, better focus. Every module shares a consistent design system
            so you stop relearning your own software every sprint.
          </p>
        </div>

        <div class="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <article
            v-for="f in features"
            :key="f.title"
            class="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.05] sm:p-6"
            data-reveal
          >
            <span
              class="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r"
              :class="f.accent"
              aria-hidden="true"
            />
            <div
              class="flex h-10 w-10 items-center justify-center rounded-xl ring-1"
              :class="f.iconBg"
              aria-hidden="true"
            >
              <span class="h-5 w-5 [&>svg]:h-full [&>svg]:w-full" v-html="f.icon" />
            </div>
            <h3 class="mt-4 text-[15px] font-semibold tracking-tight text-white">
              {{ f.title }}
            </h3>
            <p class="mt-1.5 text-[13.5px] leading-relaxed text-slate-400">
              {{ f.body }}
            </p>
          </article>
        </div>
      </div>
    </section>

    <!--
      Scroll-driven showcase with true scroll hijacking
      - Section is exactly one viewport tall. When it fully fills the viewport,
        wheel / touch / keyboard gestures are intercepted: each gesture advances
        one step instead of scrolling the page.
      - Once the user exhausts the steps in the direction they're scrolling,
        we release the interception and the page scroll resumes cleanly.
      - Everything lives inside the section so nothing can overlap.
    -->
    <section
      id="showcase"
      class="relative z-10 mt-20 sm:mt-28"
      aria-labelledby="showcase-title"
    >
      <!-- Desktop: pinned tour with scroll hijack -->
      <div
        ref="showcaseEl"
        class="showcase-hijack relative hidden lg:block"
      >
        <div class="h-full overflow-hidden">
          <div class="mx-auto flex h-full max-w-[1200px] flex-col gap-6 px-8 pb-10 pt-16">
            <!-- Tour header (inside the sticky pane, so it never overlaps step content) -->
            <header class="flex flex-wrap items-end justify-between gap-4">
              <div class="max-w-2xl">
                <span class="text-[11px] font-semibold uppercase tracking-[0.2em] text-fuchsia-300">
                  Scroll tour
                </span>
                <h2
                  id="showcase-title"
                  class="mt-1.5 text-3xl font-bold tracking-tight text-white sm:text-4xl"
                >
                  Six modules, one quiet workspace.
                </h2>
              </div>
              <span
                class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold text-slate-300"
              >
                <span class="relative flex h-2 w-2" aria-hidden="true">
                  <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-fuchsia-400/60" />
                  <span class="relative inline-flex h-2 w-2 rounded-full bg-fuchsia-400" />
                </span>
                Step {{ activeStep + 1 }} of {{ showcaseSteps.length }}
              </span>
            </header>

            <!-- Content grid: tabs (left) + preview (right) -->
            <div class="grid min-h-0 flex-1 grid-cols-12 gap-8">
              <!-- Tabs list (independently scrollable so it never clips) -->
              <ol
                class="scrollbar-kit col-span-5 flex min-h-0 flex-col gap-2 overflow-y-auto pr-2"
              >
                <li
                  v-for="(step, i) in showcaseSteps"
                  :key="step.title"
                >
                  <button
                    type="button"
                    class="group w-full rounded-2xl border p-4 text-left transition-all duration-300"
                    :class="
                      activeStep === i
                        ? 'border-white/15 bg-white/[0.06] shadow-[0_14px_60px_rgba(56,189,248,0.12)]'
                        : 'border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]'
                    "
                    @click="scrollToStep(i)"
                  >
                    <div class="flex items-start gap-3">
                      <span
                        class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold transition"
                        :class="
                          activeStep === i
                            ? 'bg-white text-slate-900 shadow-[0_10px_30px_rgba(255,255,255,0.2)]'
                            : 'bg-white/5 text-slate-300 ring-1 ring-white/10'
                        "
                      >
                        {{ String(i + 1).padStart(2, "0") }}
                      </span>
                      <div class="min-w-0 flex-1">
                        <div class="flex items-center gap-2">
                          <h3
                            class="text-[14px] font-semibold tracking-tight transition"
                            :class="activeStep === i ? 'text-white' : 'text-slate-200'"
                          >
                            {{ step.title }}
                          </h3>
                          <span
                            v-if="step.tag"
                            class="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-slate-300"
                          >
                            {{ step.tag }}
                          </span>
                        </div>
                        <p
                          v-if="activeStep === i"
                          class="mt-1 text-[12.5px] leading-relaxed text-slate-300"
                        >
                          {{ step.body }}
                        </p>
                        <ul
                          v-if="activeStep === i && step.highlights"
                          class="mt-2 space-y-1 text-[12px] text-slate-300"
                        >
                          <li
                            v-for="h in step.highlights"
                            :key="h"
                            class="flex items-start gap-2"
                          >
                            <svg class="mt-[3px] h-3 w-3 shrink-0 text-sky-300" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                              <path d="M4.5 8l2.2 2.2L11.8 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                            <span>{{ h }}</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </button>
                </li>
              </ol>

              <!-- Preview -->
              <div class="col-span-7 flex min-h-0 flex-col">
                <div class="relative flex min-h-0 flex-1 overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70 p-2 shadow-[0_40px_120px_rgba(2,6,23,0.55)] backdrop-blur-xl">
                  <div class="flex min-h-0 w-full flex-col rounded-2xl border border-white/5 bg-gradient-to-b from-slate-950 to-slate-900">
                    <div class="flex shrink-0 items-center gap-1.5 border-b border-white/10 px-4 py-3">
                      <span class="h-2.5 w-2.5 rounded-full bg-rose-400/70" />
                      <span class="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
                      <span class="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
                      <span class="mx-3 text-[11px] font-semibold text-slate-500">
                        {{ brand }} · {{ showcaseSteps[activeStep].title }}
                      </span>
                      <span class="ml-auto text-[11px] font-medium tabular-nums text-slate-500">
                        {{ activeStep + 1 }} / {{ showcaseSteps.length }}
                      </span>
                    </div>
                    <div
                      class="relative min-h-[clamp(280px,48vh,560px)] flex-1 overflow-hidden"
                    >
                      <transition name="stage-fade" mode="out-in">
                        <component
                          :is="showcaseSteps[activeStep].component"
                          :key="activeStep"
                          class="h-full min-h-[inherit]"
                        />
                      </transition>
                    </div>
                  </div>
                  <div
                    class="pointer-events-none absolute inset-x-4 -bottom-3 h-10 rounded-full bg-sky-500/25 blur-2xl"
                    aria-hidden="true"
                  />
                </div>
              </div>
            </div>

            <!-- Progress bar pinned at the bottom -->
            <div class="flex shrink-0 items-center gap-3">
              <div class="relative h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                <span
                  class="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-sky-400 via-indigo-400 to-fuchsia-400 transition-[width] duration-150 ease-out"
                  :style="{ width: `${Math.round(progress * 100)}%` }"
                />
                <span
                  v-for="(step, i) in showcaseSteps"
                  :key="step.title"
                  class="absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full border border-white/30 transition"
                  :class="i <= activeStep ? 'bg-white' : 'bg-white/20'"
                  :style="{ left: `calc(${stepTickPct(i)}% - 5px)` }"
                  aria-hidden="true"
                />
              </div>
              <span class="w-12 text-right text-[11px] font-semibold tabular-nums text-slate-400">
                {{ Math.round(progress * 100) }}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Mobile / small viewports: stacked preview list, no pinning -->
      <div class="space-y-6 px-5 sm:px-8 lg:hidden">
        <header class="max-w-2xl" data-reveal>
          <span class="text-[11px] font-semibold uppercase tracking-[0.2em] text-fuchsia-300">
            Scroll tour
          </span>
          <h2 class="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Six modules, one quiet workspace.
          </h2>
        </header>
        <article
          v-for="(step, i) in showcaseSteps"
          :key="step.title"
          class="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]"
          data-reveal
        >
          <header class="flex items-start gap-3 p-4">
            <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-[12px] font-bold text-white ring-1 ring-white/10">
              {{ String(i + 1).padStart(2, "0") }}
            </span>
            <div class="min-w-0 flex-1">
              <h3 class="text-[15px] font-semibold text-white">{{ step.title }}</h3>
              <p class="mt-1 text-[13px] text-slate-400">{{ step.body }}</p>
            </div>
          </header>
          <div class="relative h-[260px] overflow-hidden border-t border-white/5 bg-gradient-to-b from-slate-950 to-slate-900 sm:h-[320px]">
            <component :is="step.component" class="h-full" />
          </div>
        </article>
      </div>
    </section>

    <!-- Stats callout (flows directly below the scroll-hijack section) -->
    <section class="relative z-10 mt-6 px-5 sm:mt-10 sm:px-8">
      <div class="mx-auto max-w-[1200px] overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/90 via-slate-950 to-indigo-950/60 p-6 sm:p-10">
        <div class="grid grid-cols-2 gap-6 sm:grid-cols-4">
          <div v-for="m in metrics" :key="m.label" data-reveal>
            <p class="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
              {{ m.value }}
            </p>
            <p class="mt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              {{ m.label }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section id="faq" class="relative z-10 mt-16 px-5 sm:mt-20 sm:px-8" aria-labelledby="faq-title">
      <div class="mx-auto max-w-[900px]">
        <div class="max-w-2xl" data-reveal>
          <span class="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-300">
            Questions
          </span>
          <h2
            id="faq-title"
            class="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl"
          >
            Fine print without the fine print.
          </h2>
        </div>
        <div class="mt-10 space-y-2" data-reveal>
          <!--
            Vue-controlled accordion so we can animate panel height smoothly
            (native <details> can't cross-fade / resize without layout jumps)
            and enforce single-open behavior.
          -->
          <div
            v-for="(q, i) in faq"
            :key="q.q"
            class="rounded-2xl border transition-colors duration-200"
            :class="
              openFaq === i
                ? 'border-white/20 bg-white/[0.05]'
                : 'border-white/10 bg-white/[0.03]'
            "
          >
            <button
              type="button"
              class="flex w-full items-center justify-between gap-4 rounded-2xl p-5 text-left text-[14px] font-semibold text-white transition hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/40"
              :aria-expanded="openFaq === i"
              :aria-controls="`faq-panel-${i}`"
              @click="toggleFaq(i)"
            >
              <span class="min-w-0 flex-1">{{ q.q }}</span>
              <span
                class="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 text-slate-300 transition"
                :class="openFaq === i ? 'rotate-45 bg-white/10 text-white' : ''"
              >
                <svg class="h-3 w-3" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M8 2v12M2 8h12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                </svg>
              </span>
            </button>
            <transition
              name="faq"
              @enter="onFaqEnter"
              @after-enter="onFaqAfterEnter"
              @leave="onFaqLeave"
            >
              <div
                v-if="openFaq === i"
                :id="`faq-panel-${i}`"
                class="faq-panel overflow-hidden"
              >
                <p class="px-5 pb-5 text-[13.5px] leading-relaxed text-slate-300">{{ q.a }}</p>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="relative z-10 mt-16 px-5 sm:mt-20 sm:px-8">
      <div
        class="mx-auto max-w-[1100px] overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-sky-500/30 via-indigo-600/20 to-fuchsia-500/20 p-8 sm:p-12"
        data-reveal
      >
        <div class="flex flex-col items-start gap-6 sm:items-center sm:text-center">
          <span class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-200">
            Ready in seconds
          </span>
          <h2 class="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
            Take it for a spin — no card, no install.
          </h2>
          <p class="max-w-2xl text-[15px] leading-relaxed text-slate-200 md:text-base">
            Everything is rendered client-side in a demo sandbox. Sign in with one of the demo accounts
            to see the full workspace — payslips, tasks, notifications, the lot.
          </p>
          <div class="flex flex-col gap-3 sm:flex-row">
            <RouterLink
              to="/login"
              class="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 text-[14px] font-semibold text-slate-900 shadow-lg transition hover:bg-slate-100"
            >
              Launch the demo
            </RouterLink>
            <RouterLink
              to="/register"
              class="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/20 bg-transparent px-6 text-[14px] font-semibold text-white transition hover:bg-white/10"
            >
              Create an account
            </RouterLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="relative z-10 mt-12 border-t border-white/5 px-5 py-8 sm:mt-16 sm:px-8">
      <div class="mx-auto flex max-w-[1200px] flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-center gap-2.5">
          <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 ring-1 ring-white/10">
            <img src="/logo-mark.svg" :alt="brand" class="h-5 w-5" />
          </span>
          <div class="text-[13px]">
            <p class="font-semibold text-white">{{ brand }}</p>
            <p class="text-slate-500">© {{ year }} {{ brand }}. Built with care.</p>
          </div>
        </div>
        <nav class="flex flex-wrap items-center gap-4 text-[13px] text-slate-400" aria-label="Legal">
          <a href="#features" class="hover:text-white">Features</a>
          <a href="#showcase" class="hover:text-white">Tour</a>
          <a href="#faq" class="hover:text-white">FAQ</a>
          <RouterLink to="/login" class="hover:text-white">Sign in</RouterLink>
          <RouterLink to="/register" class="hover:text-white">Register</RouterLink>
        </nav>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import { RouterLink } from "vue-router";
import { BRAND } from "@/config/brand.js";
import { useRevealOnScroll } from "@/composables/useScrollProgress.js";
import AppMockup from "@/components/shared/landing/AppMockup.vue";
import StageDashboard from "@/components/shared/landing/StageDashboard.vue";
import StageTasks from "@/components/shared/landing/StageTasks.vue";
import StageTimesheet from "@/components/shared/landing/StageTimesheet.vue";
import StageLeaves from "@/components/shared/landing/StageLeaves.vue";
import StagePayroll from "@/components/shared/landing/StagePayroll.vue";
import StageNotifications from "@/components/shared/landing/StageNotifications.vue";

const brand = BRAND.name;
const year = new Date().getFullYear();

const rootEl = ref(null);
const showcaseEl = ref(null);

useRevealOnScroll(rootEl);

const navItems = [
  { id: "features", label: "Features" },
  { id: "showcase", label: "Tour" },
  { id: "faq", label: "FAQ" },
];

const navScrolled = ref(false);
let rafQueued = false;

function onScroll() {
  if (rafQueued) return;
  rafQueued = true;
  window.requestAnimationFrame(() => {
    rafQueued = false;
    navScrolled.value = (window.scrollY || document.documentElement.scrollTop) > 8;
  });
}

onMounted(() => {
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  installHijack();
});

onUnmounted(() => {
  window.removeEventListener("scroll", onScroll);
  removeHijack();
});

const heroStats = [
  { label: "Modules", value: "11+" },
  { label: "Realtime", value: "0 ms" },
  { label: "Setup", value: "< 60 s" },
];

const badges = [
  "Distributed teams",
  "Operations",
  "Payroll",
  "People ops",
  "Remote-first",
  "Hybrid",
];

const ICON_FEATURES = {
  bell: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 16v-4a6 6 0 10-12 0v4l-2 2h16l-2-2z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M10 20a2 2 0 004 0" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  shield: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 3l7 3v5c0 4.2-3 7.7-7 9-4-1.3-7-4.8-7-9V6l7-3z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  clock: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="8.5" stroke="currentColor" stroke-width="1.5"/><path d="M12 7v5l3 2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>`,
  layers: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 3l8 4.5-8 4.5-8-4.5L12 3zm8 9L12 16.5 4 12m16 4.5L12 21l-8-4.5" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>`,
  sparkle: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 3l1.8 5 5 1.8-5 1.8L12 16.4l-1.8-4.8-5-1.8 5-1.8L12 3zm7 11l.9 2.5L22 17.4l-2.1.9L19 20.8l-.9-2.5L16 17.4l2.1-.9L19 14z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>`,
  stack: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="4" width="16" height="7" rx="2" stroke="currentColor" stroke-width="1.5"/><rect x="4" y="13" width="16" height="7" rx="2" stroke="currentColor" stroke-width="1.5"/></svg>`,
};

const features = [
  {
    title: "Notification center that respects focus",
    body: "Real-time, grouped by day, with a bottom-sheet on mobile and Security / Activity / System tabs so work pings stay separate from sign-in events.",
    icon: ICON_FEATURES.bell,
    iconBg: "bg-sky-500/15 text-sky-300 ring-sky-500/30",
    accent: "from-sky-400/0 via-sky-400/60 to-sky-400/0",
  },
  {
    title: "Secure by default",
    body: "SHA-256 password hashing, timing-safe compares, lockouts after repeated failures, and an activity log that strips secrets before anything touches storage.",
    icon: ICON_FEATURES.shield,
    iconBg: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30",
    accent: "from-emerald-400/0 via-emerald-400/60 to-emerald-400/0",
  },
  {
    title: "Real-time timesheet",
    body: "Timer that survives reloads, tracked offline, and emits live activity into your inbox — with a clean weekly timesheet view baked in.",
    icon: ICON_FEATURES.clock,
    iconBg: "bg-violet-500/15 text-violet-300 ring-violet-500/30",
    accent: "from-violet-400/0 via-violet-400/60 to-violet-400/0",
  },
  {
    title: "A kanban that doesn't get in the way",
    body: "Drag, comment, clone, move. Each action lands in the activity log so nothing quiet happens without you knowing.",
    icon: ICON_FEATURES.layers,
    iconBg: "bg-fuchsia-500/15 text-fuchsia-300 ring-fuchsia-500/30",
    accent: "from-fuchsia-400/0 via-fuchsia-400/60 to-fuchsia-400/0",
  },
  {
    title: "Payroll that reads like English",
    body: "Currency-aware payslips, exportable PDFs, gross / net breakdowns, and dark-mode friendly charts instead of Excel screenshots.",
    icon: ICON_FEATURES.sparkle,
    iconBg: "bg-amber-500/15 text-amber-300 ring-amber-500/30",
    accent: "from-amber-400/0 via-amber-400/60 to-amber-400/0",
  },
  {
    title: "Consistent across breakpoints",
    body: "Mobile, tablet, laptop, desktop, 4K — the same experience, not a squished one. Sidebar becomes a drawer, header shrinks, touch targets grow.",
    icon: ICON_FEATURES.stack,
    iconBg: "bg-rose-500/15 text-rose-300 ring-rose-500/30",
    accent: "from-rose-400/0 via-rose-400/60 to-rose-400/0",
  },
];

/**
 * Six-module scroll tour: lightweight HTML/Tailwind stage mocks (original
 * design). Hero still uses real screenshots in `AppMockup`.
 */
const showcaseSteps = [
  {
    title: "Open the Dashboard",
    tag: "Home",
    body: "A calm, actionable overview of the day — pay trends, quick time entry, and rule-based insights for leaves, projects, and tasks.",
    component: StageDashboard,
    highlights: [
      "Personalised greeting & workload summary",
      "Live hours chart for the last 7 days",
      "Surfaces blockers from every module",
    ],
  },
  {
    title: "Run your task board",
    tag: "Kanban",
    body: "Drag cards between columns with pointer events that feel native on both mouse and touch. Every move lands in the activity log with a one-click undo.",
    component: StageTasks,
    highlights: [
      "Drag, clone, comment, archive",
      "Filters by project, tag and owner",
      "Undo-safe moves via the activity log",
    ],
  },
  {
    title: "Log time without friction",
    tag: "Timesheet",
    body: "Start the timer from the dashboard, add retrospective entries from the weekly grid, and the running timer survives page reloads and tab switches.",
    component: StageTimesheet,
    highlights: [
      "Persistent timer across refreshes",
      "Weekly grid with project totals",
      "Exports straight to your payroll pipeline",
    ],
  },
  {
    title: "Plan leaves and coverage",
    tag: "Leaves",
    body: "Request annual, sick, or WFH days with a visual team calendar that flags overlaps before they become a problem.",
    component: StageLeaves,
    highlights: [
      "Team-wide coverage at a glance",
      "Status transitions with audit trail",
      "Keeps remaining balance in sight",
    ],
  },
  {
    title: "Understand your payslips",
    tag: "Payroll",
    body: "Currency-aware payslips, breakdowns you can actually read, and PDF exports — no Excel screenshots taped to emails.",
    component: StagePayroll,
    highlights: [
      "Gross / net, tax and NI split out",
      "YTD totals with share-to-payroll parity",
      "One-click PDF for any period",
    ],
  },
  {
    title: "Stay in the loop, not in your inbox",
    tag: "Notifications",
    body: "A single canonical inbox for signals — severity-coded, routed to the right page, grouped by day, mirrored across tabs in real time.",
    component: StageNotifications,
    highlights: [
      "Security / Activity / System tabs",
      "Click a card to jump straight to it",
      "Push popup respects focus and mute rules",
    ],
  },
];

/**
 * Scroll-hijacking state machine for the showcase.
 *
 * The section is exactly 100vh tall. When the user scrolls until the section
 * fully fills the viewport we intercept wheel / touch / keyboard events and
 * advance the step instead of letting the page scroll. Once the user would
 * scroll past the last step (or before the first one) in that direction, we
 * release the hijack so page scroll resumes naturally.
 *
 * Why not CSS scroll snap? Scroll snap can't express "advance an in-component
 * tab on every scroll gesture without moving the viewport", which is exactly
 * what the user asked for here.
 */
const activeStep = ref(0);
const hijackArmed = ref(false);
const progress = computed(() => {
  const total = Math.max(1, showcaseSteps.length - 1);
  return Math.min(1, Math.max(0, activeStep.value / total));
});

// Gesture tuning. STEP_INTERVAL stops a single trackpad flick from blowing
// through every step; WHEEL_ACCUM_* requires a minimum intent before we
// switch step, so tiny scroll jitters get ignored.
const STEP_INTERVAL_MS = 420;
const WHEEL_ACCUM_THRESHOLD = 32;
const TOUCH_THRESHOLD = 36;

let wheelAccumulator = 0;
let lastStepAt = 0;
let touchAnchorY = null;

function canStepForward() {
  return activeStep.value < showcaseSteps.length - 1;
}
function canStepBackward() {
  return activeStep.value > 0;
}

function setStep(delta) {
  const now = Date.now();
  if (now - lastStepAt < STEP_INTERVAL_MS) return false;
  if (delta > 0 && canStepForward()) {
    activeStep.value += 1;
    lastStepAt = now;
    return true;
  }
  if (delta < 0 && canStepBackward()) {
    activeStep.value -= 1;
    lastStepAt = now;
    return true;
  }
  return false;
}

function isFullyPinned() {
  const el = showcaseEl.value;
  if (!el) return false;
  const rect = el.getBoundingClientRect();
  const vh = window.innerHeight || document.documentElement.clientHeight;
  // Section occupies >= 92% of the viewport — good enough that we can
  // confidently claim the scroll gesture.
  const visibleHeight = Math.min(rect.bottom, vh) - Math.max(rect.top, 0);
  return visibleHeight >= vh * 0.92;
}

function onWheel(e) {
  if (!hijackArmed.value || !isFullyPinned()) return;

  const down = e.deltaY > 0;
  const up = e.deltaY < 0;

  // Let the page keep scrolling once we've exhausted steps in this direction.
  if ((down && !canStepForward()) || (up && !canStepBackward())) return;

  e.preventDefault();
  wheelAccumulator += e.deltaY;
  if (Math.abs(wheelAccumulator) < WHEEL_ACCUM_THRESHOLD) return;

  const advanced = setStep(Math.sign(wheelAccumulator));
  if (advanced) wheelAccumulator = 0;
}

function onTouchStart(e) {
  if (!hijackArmed.value || !isFullyPinned()) {
    touchAnchorY = null;
    return;
  }
  touchAnchorY = e.touches?.[0]?.clientY ?? null;
}

function onTouchMove(e) {
  if (touchAnchorY == null) return;
  const current = e.touches?.[0]?.clientY ?? null;
  if (current == null) return;
  const diff = touchAnchorY - current;
  const down = diff > 0;
  const up = diff < 0;
  if ((down && !canStepForward()) || (up && !canStepBackward())) return;
  if (Math.abs(diff) < TOUCH_THRESHOLD) {
    e.preventDefault();
    return;
  }
  e.preventDefault();
  if (setStep(Math.sign(diff))) {
    touchAnchorY = current;
  }
}

function onKey(e) {
  if (!hijackArmed.value || !isFullyPinned()) return;
  const forward = ["ArrowDown", "PageDown", " ", "ArrowRight"];
  const backward = ["ArrowUp", "PageUp", "ArrowLeft"];
  if (forward.includes(e.key)) {
    if (canStepForward()) {
      e.preventDefault();
      setStep(1);
    }
  } else if (backward.includes(e.key)) {
    if (canStepBackward()) {
      e.preventDefault();
      setStep(-1);
    }
  }
}

function stepTickPct(i) {
  if (showcaseSteps.length <= 1) return 0;
  return Math.round((i / (showcaseSteps.length - 1)) * 100);
}

/**
 * Jump directly to a given step. Used when the user clicks a tab card in the
 * left column — no fiddly scroll math, just set the state and let the
 * transition do the rest.
 */
function scrollToStep(i) {
  activeStep.value = Math.min(showcaseSteps.length - 1, Math.max(0, i));
  lastStepAt = Date.now();
}

let hijackObserver = null;

function installHijack() {
  if (!showcaseEl.value) return;
  hijackObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        // Arm the hijack whenever the section occupies most of the viewport.
        hijackArmed.value = entry.intersectionRatio > 0.85;
      }
    },
    { threshold: [0, 0.5, 0.85, 1] },
  );
  hijackObserver.observe(showcaseEl.value);

  window.addEventListener("wheel", onWheel, { passive: false });
  window.addEventListener("touchstart", onTouchStart, { passive: true });
  window.addEventListener("touchmove", onTouchMove, { passive: false });
  window.addEventListener("keydown", onKey);
}

function removeHijack() {
  hijackObserver?.disconnect();
  hijackObserver = null;
  window.removeEventListener("wheel", onWheel);
  window.removeEventListener("touchstart", onTouchStart);
  window.removeEventListener("touchmove", onTouchMove);
  window.removeEventListener("keydown", onKey);
}

const metrics = [
  { value: "11+", label: "Workspace modules" },
  { value: "0", label: "Tracking scripts" },
  { value: "< 200 KB", label: "Main bundle (gzipped)" },
  { value: "A11y", label: "Keyboard + screen reader" },
];

const faq = [
  {
    q: "Is any of my data uploaded?",
    a: "No — this demo lives entirely in your browser. The auth flow uses SHA-256 hashing locally, and your activity log is stored under a per-user localStorage key.",
  },
  {
    q: "Can I try it without creating an account?",
    a: "Yes. Register a new account from the sign-in screen in seconds — credentials are hashed and stored locally so you can explore the full workspace immediately.",
  },
  {
    q: "How does real-time work without a server?",
    a: "Cross-tab state is synced with BroadcastChannel (with a storage-event fallback). Dropping in a WebSocket / SSE layer would plug directly into the same notification store.",
  },
  {
    q: "Is it accessible?",
    a: "Focus rings, aria-labels, reduced-motion support, keyboard traversal on modals and drawers, and sensible heading hierarchy throughout.",
  },
];

const openFaq = ref(0);
function toggleFaq(i) {
  openFaq.value = openFaq.value === i ? -1 : i;
}

/**
 * Animated height transitions for the FAQ panels. We measure the panel's
 * scrollHeight on enter/leave and walk from 0 → content height (and back)
 * so the accordion never jumps, even when the answer is long.
 */
function onFaqEnter(el) {
  el.style.height = "0px";
  el.style.opacity = "0";
  el.offsetHeight;
  el.style.transition = "height 0.28s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.22s ease";
  el.style.height = `${el.scrollHeight}px`;
  el.style.opacity = "1";
}
function onFaqAfterEnter(el) {
  el.style.height = "";
  el.style.transition = "";
  el.style.opacity = "";
}
function onFaqLeave(el) {
  el.style.height = `${el.scrollHeight}px`;
  el.offsetHeight;
  el.style.transition = "height 0.22s ease, opacity 0.16s ease";
  el.style.height = "0px";
  el.style.opacity = "0";
}
</script>

<style scoped>
.landing [data-reveal] {
  opacity: 0;
  transform: translateY(14px);
  transition:
    opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
}
.landing [data-reveal].is-in {
  opacity: 1;
  transform: translateY(0);
}

@media (prefers-reduced-motion: reduce) {
  .landing [data-reveal] {
    opacity: 1;
    transform: none;
    transition: none;
  }
}

.stage-fade-enter-active,
.stage-fade-leave-active {
  transition:
    opacity 0.35s ease,
    transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.stage-fade-enter-from {
  opacity: 0;
  transform: translateY(12px) scale(0.99);
}
.stage-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.99);
}

/*
 * Showcase section: keep overscroll from chaining to the parent so the
 * hijack feels deliberate. 100svh (small-viewport height) avoids the iOS
 * address bar resizing issue where vh jumps at the wrong moment.
 */
.showcase-hijack {
  overscroll-behavior: contain;
  height: 100svh;
}

@media (prefers-reduced-motion: reduce) {
  .stage-fade-enter-active,
  .stage-fade-leave-active {
    transition: opacity 0.15s ease;
  }
  .stage-fade-enter-from,
  .stage-fade-leave-to {
    transform: none;
  }
}
</style>
