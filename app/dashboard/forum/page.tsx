import { MessageSquare } from "lucide-react"

export default function DashboardForumPage() {
  return (
    <div className="p-4 md:p-6">
      <div className="mb-4 flex items-center gap-2">
        <MessageSquare className="size-5 text-cyan-300" />
        <h1 className="text-xl font-semibold">Q&A Forum</h1>
      </div>
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-sm text-white/80">
        {"Your forum content goes here. This page deliberately avoids importing a Vault icon."}
      </div>
    </div>
  )
}
