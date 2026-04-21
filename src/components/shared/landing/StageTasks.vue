<template>
  <div class="h-full overflow-hidden p-4 sm:p-6">
    <div class="flex items-center justify-between">
      <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Task board</p>
      <p class="text-[10px] text-slate-500">Roadmap Q3</p>
    </div>
    <div class="mt-4 grid grid-cols-3 gap-3">
      <section
        v-for="col in columns"
        :key="col.title"
        class="rounded-xl border border-white/5 bg-white/[0.03] p-2"
      >
        <header class="flex items-center justify-between px-2 py-1">
          <p class="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">{{ col.title }}</p>
          <span class="text-[10px] font-semibold text-slate-500">{{ col.cards.length }}</span>
        </header>
        <div class="mt-1 space-y-1.5">
          <article
            v-for="c in col.cards"
            :key="c.title"
            class="rounded-lg border border-white/5 bg-slate-900/80 p-2.5 shadow-sm"
          >
            <p class="truncate text-[11px] font-semibold text-white">{{ c.title }}</p>
            <div class="mt-1.5 flex items-center justify-between">
              <span
                class="inline-flex items-center rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                :class="c.tagClass"
              >
                {{ c.tag }}
              </span>
              <span class="flex -space-x-1.5">
                <span
                  v-for="(avatar, i) in c.avatars"
                  :key="i"
                  class="h-4 w-4 rounded-full ring-2 ring-slate-900"
                  :class="avatar"
                />
              </span>
            </div>
          </article>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
const columns = [
  {
    title: "To do",
    cards: [
      { title: "Draft Q3 hiring plan", tag: "HR", tagClass: "bg-rose-500/15 text-rose-300", avatars: ["bg-gradient-to-br from-rose-300 to-rose-500"] },
      { title: "Review payroll discrepancies", tag: "Finance", tagClass: "bg-amber-500/15 text-amber-300", avatars: ["bg-gradient-to-br from-amber-300 to-amber-500"] },
    ],
  },
  {
    title: "In progress",
    cards: [
      { title: "Ship notification v2", tag: "Eng", tagClass: "bg-sky-500/15 text-sky-300", avatars: ["bg-gradient-to-br from-sky-300 to-indigo-500", "bg-gradient-to-br from-fuchsia-300 to-fuchsia-500"] },
      { title: "Audit leave workflow", tag: "Ops", tagClass: "bg-violet-500/15 text-violet-300", avatars: ["bg-gradient-to-br from-violet-300 to-violet-600"] },
    ],
  },
  {
    title: "Shipped",
    cards: [
      { title: "Dark mode sweep", tag: "Design", tagClass: "bg-emerald-500/15 text-emerald-300", avatars: ["bg-gradient-to-br from-emerald-300 to-teal-500"] },
    ],
  },
];
</script>
