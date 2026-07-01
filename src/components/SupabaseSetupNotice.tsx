export default function SupabaseSetupNotice() {
  return (
    <div className="mb-6 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
      Supabaseが未接続です。<code className="font-mono">.env.local</code>{" "}
      に{" "}
      <code className="font-mono">NEXT_PUBLIC_SUPABASE_URL</code> と{" "}
      <code className="font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>{" "}
      を設定してください。
    </div>
  );
}
