export default function SupremeAdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Supreme Admin
        </h1>

        <p className="text-slate-500 mt-2">
          Global administration controls for ACC #7C.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold">
            Commanders
          </h2>

          <p className="text-sm text-slate-500 mt-2">
            Manage server commanders.
          </p>
        </div>

        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold">
            Alliances
          </h2>

          <p className="text-sm text-slate-500 mt-2">
            Manage alliances and settings.
          </p>
        </div>

        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold">
            Audit Logs
          </h2>

          <p className="text-sm text-slate-500 mt-2">
            Review platform activity.
          </p>
        </div>

      </div>
    </div>
  )
}