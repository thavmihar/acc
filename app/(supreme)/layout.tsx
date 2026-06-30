import Link from 'next/link'

export default function SupremeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex bg-slate-50">

      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 p-5 flex flex-col gap-2">

        <div className="mb-6">
          <h1 className="text-xl font-bold text-slate-900">
            1307 COMMAND CENTER
          </h1>

          <p className="text-sm text-slate-500">
            Supreme Console
          </p>
        </div>

        <Link href="/supreme-dashboard" className="p-3 rounded-lg hover:bg-slate-100">
          ⌂ Dashboard
        </Link>

        <Link href="/commanders" className="p-3 rounded-lg hover:bg-slate-100">
          ◉ Commanders
        </Link>

        <Link href="/alliances" className="p-3 rounded-lg hover:bg-slate-100">
          ◈ Alliances
        </Link>

      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        {children}
      </main>

    </div>
  )
}