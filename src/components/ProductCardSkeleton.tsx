export default function ProductCardSkeleton() {
  return (
    <article className="flex animate-pulse flex-col overflow-hidden rounded-xl bg-white shadow-sm">
      {/* IMAGE */}
      <div className="h-40 bg-gray-200" />

      {/* CONTENT */}
      <div className="flex flex-1 flex-col px-2 py-3">
        {/* Nama */}
        <div className="h-4 w-3/4 rounded bg-gray-200" />

        {/* Harga */}
        <div className="mt-2 h-3 w-1/2 rounded bg-gray-200" />

        {/* Bottom actions */}
        <div className="mt-auto flex items-center gap-3 pt-3">
          {/* Counter skeleton */}
          <div className="flex items-center gap-2 rounded-lg border p-1">
            <div className="h-6 w-6 rounded bg-gray-200" />
            <div className="h-4 w-6 rounded bg-gray-200" />
            <div className="h-6 w-6 rounded bg-gray-200" />
          </div>

          {/* Add button skeleton */}
          <div className="ml-auto h-8 w-10 rounded-lg bg-gray-200" />
        </div>
      </div>
    </article>
  );
}
