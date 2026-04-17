<template>
  <div class="flex flex-col items-center justify-center h-full min-h-[60vh] text-center px-4">
    <div class="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
      <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    </div>
    <h1 class="page-title mb-1">{{ $route.meta.title }}</h1>
    <p class="text-gray-500 max-w-sm">This section is under construction and will be available soon.</p>
  </div>
</template>
