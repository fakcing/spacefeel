import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <div className="text-[120px] md:text-[180px] font-bold leading-none bg-gradient-to-b from-white to-white/10 bg-clip-text text-transparent select-none">
        404
      </div>
      <h2 className="text-xl font-semibold mt-4 mb-2">This title doesn&apos;t exist in our universe</h2>
      <p className="text-[var(--text-muted)] text-sm mb-8 max-w-sm">
        The page you&apos;re looking for has drifted into deep space.
      </p>
      <Link
        href="/"
        className="bg-white text-black font-semibold rounded-full px-8 py-3 hover:bg-white/90 transition-colors"
      >
        Back to Home
      </Link>
    </div>
  )
}
