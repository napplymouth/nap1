import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const adminClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const TEST_ACCOUNTS = [
  {
    email: "test.member@nap.test",
    password: "TestMember123!",
    meta: { full_name: "Test Member", user_type: "member" },
    table: "member_profiles",
    profile: {
      full_name: "Test Member",
      email: "test.member@nap.test",
      member_role: "community_member",
      approval_status: "approved",
      approved_at: new Date().toISOString(),
    },
  },
  {
    email: "test.volunteer@nap.test",
    password: "TestVolunteer123!",
    meta: { full_name: "Test Volunteer", user_type: "volunteer" },
    table: "volunteer_profiles",
    profile: {
      full_name: "Test Volunteer",
      email: "test.volunteer@nap.test",
      volunteer_role: "outreach_volunteer",
      approval_status: "approved",
      approved_at: new Date().toISOString(),
    },
  },
  {
    email: "test.professional@nap.test",
    password: "TestPro123!",
    meta: { full_name: "Test Professional", user_type: "professional" },
    table: "professional_profiles",
    profile: {
      full_name: "Test Professional",
      email: "test.professional@nap.test",
      profession_type: "GP (General Practitioner)",
      employer_organisation: "Plymouth NHS Trust",
      approval_status: "approved",
    },
  },
];

Deno.serve(async () => {
  const results: Record<string, string> = {};

  for (const account of TEST_ACCOUNTS) {
    try {
      // Try to create the auth user
      const { data: created, error: createError } =
        await adminClient.auth.admin.createUser({
          email: account.email,
          password: account.password,
          email_confirm: true,
          user_metadata: account.meta,
        });

      let userId: string;

      if (createError) {
        // User may already exist — look them up
        const { data: list } = await adminClient.auth.admin.listUsers();
        const existing = list?.users?.find((u) => u.email === account.email);
        if (!existing) {
          results[account.email] = `ERROR: ${createError.message}`;
          continue;
        }
        userId = existing.id;
        // Ensure email is confirmed
        await adminClient.auth.admin.updateUserById(userId, {
          email_confirm: true,
        });
      } else {
        userId = created.user.id;
      }

      // Upsert the profile record
      const { error: profileError } = await adminClient
        .from(account.table)
        .upsert({ user_id: userId, ...account.profile }, { onConflict: "user_id" });

      if (profileError) {
        results[account.email] = `Auth OK but profile error: ${profileError.message}`;
      } else {
        results[account.email] = `OK — user_id: ${userId}`;
      }
    } catch (err: any) {
      results[account.email] = `EXCEPTION: ${err.message}`;
    }
  }

  return new Response(JSON.stringify({ success: true, results }, null, 2), {
    headers: { "Content-Type": "application/json" },
  });
});
