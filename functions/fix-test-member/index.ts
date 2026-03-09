import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Service role client bypasses RLS entirely
const adminClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
  db: { schema: "public" },
});

Deno.serve(async () => {
  const results: Record<string, string> = {};

  // Step 1: Find or create the test.member auth user
  let userId: string | null = null;

  const { data: list, error: listError } = await adminClient.auth.admin.listUsers({ perPage: 1000 });
  if (listError) {
    return new Response(JSON.stringify({ success: false, error: listError.message }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  const existing = list?.users?.find((u: any) => u.email === "test.member@nap.test");

  if (existing) {
    userId = existing.id;
    await adminClient.auth.admin.updateUserById(userId, { email_confirm: true });
    results["auth"] = `Found existing user: ${userId}`;
  } else {
    const { data: created, error: createError } = await adminClient.auth.admin.createUser({
      email: "test.member@nap.test",
      password: "TestMember123!",
      email_confirm: true,
      user_metadata: { full_name: "Test Member", user_type: "member" },
    });
    if (createError) {
      results["auth"] = `Create error: ${createError.message}`;
    } else {
      userId = created.user.id;
      results["auth"] = `Created new user: ${userId}`;
    }
  }

  if (!userId) {
    return new Response(JSON.stringify({ success: false, results }, null, 2), {
      headers: { "Content-Type": "application/json" },
    });
  }

  // Step 2: Delete any stale row first, then insert fresh
  await adminClient.from("member_profiles").delete().eq("user_id", userId);

  const { error: insertError } = await adminClient.from("member_profiles").insert({
    user_id: userId,
    full_name: "Test Member",
    email: "test.member@nap.test",
    member_role: "community_member",
    approval_status: "approved",
    approved_at: new Date().toISOString(),
  });

  if (insertError) {
    results["profile"] = `Insert error: ${insertError.message} | code: ${insertError.code}`;
  } else {
    results["profile"] = "Profile inserted successfully ✅";
  }

  // Step 3: Verify it's there
  const { data: verify, error: verifyError } = await adminClient
    .from("member_profiles")
    .select("user_id, full_name, email, approval_status")
    .eq("email", "test.member@nap.test")
    .maybeSingle();

  results["verify"] = verifyError
    ? `Verify error: ${verifyError.message}`
    : verify
    ? `Verified: ${JSON.stringify(verify)}`
    : "Row not found after insert";

  return new Response(JSON.stringify({ success: true, results }, null, 2), {
    headers: { "Content-Type": "application/json" },
  });
});
