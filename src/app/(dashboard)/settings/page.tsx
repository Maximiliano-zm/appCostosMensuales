import { createSupabaseServerClient } from "@/lib/supabase";
import { redirect } from "next/navigation";
import IncomeForm from "@/components/settings/IncomeForm";
import type { Income } from "@/types/database";

export default async function SettingsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data } = await supabase
    .from("income")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1);

  const income = (data?.[0] as unknown as Income) ?? null;

  return (
    <IncomeForm
      existingId={income?.id ?? null}
      initialAmount={income?.monthly_amount ?? 0}
      initialNote={income?.note ?? ""}
    />
  );
}
