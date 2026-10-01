/** Route-level skeleton mirroring the page hero, so navigation never flashes an empty screen. */
export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading" className="bg-forest-900 pt-[calc(var(--header-h)+5rem)] pb-24">
      <div className="container-x animate-pulse">
        <div className="h-3 w-40 rounded-full bg-white/[0.07]" />
        <div className="mt-8 h-14 w-full max-w-2xl rounded-sm bg-white/[0.06]" />
        <div className="mt-4 h-14 w-3/4 max-w-xl rounded-sm bg-white/[0.06]" />
        <div className="mt-8 h-4 w-full max-w-lg rounded-full bg-white/[0.05]" />
        <div className="mt-3 h-4 w-2/3 max-w-md rounded-full bg-white/[0.05]" />
        <div className="mt-16 grid gap-5 md:grid-cols-3">
          {[0, 1, 2].map((i) => <div key={i} className="aspect-[4/3] rounded-md bg-white/[0.04]" />)}
        </div>
      </div>
    </div>
  )
}
