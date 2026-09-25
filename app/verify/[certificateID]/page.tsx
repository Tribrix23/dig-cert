import { createClient } from "@supabase/supabase-js";
import VerifyView from "./VerifyView";

export default async function VerifyPage({ params }: { params: Promise<{ certificateID: string }> }) {
  const { certificateID } = await params;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return <div className="p-8 text-center text-red-500 font-sans">System configuration error. Supabase credentials missing.</div>;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data, error } = await supabase
    .from("certificates")
    .select("*")
    .eq("gen_id", certificateID)
    .single();

  return <VerifyView data={error ? null : data} />;
}
