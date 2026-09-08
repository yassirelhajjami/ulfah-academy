#!/usr/bin/env node
// One-off operational script: promote an existing user to admin (or
// super_admin). Requires SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in
// .env.local. The user must already have an account (register normally
// first, then run this once to elevate it).
//
// Usage:
//   node scripts/promote-admin.mjs someone@example.com
//   node scripts/promote-admin.mjs someone@example.com super_admin

import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";

const envPath = new URL("../.env.local", import.meta.url);
const env = {};
readFileSync(envPath, "utf8")
  .split("\n")
  .forEach((line) => {
    const match = line.match(/^([A-Z_]+)=(.*)$/);
    if (match) env[match[1]] = match[2];
  });

const email = process.argv[2];
const role = process.argv[3] ?? "admin";

if (!email) {
  console.error("Usage: node scripts/promote-admin.mjs <email> [admin|super_admin]");
  process.exit(1);
}
if (role !== "admin" && role !== "super_admin") {
  console.error('Role must be "admin" or "super_admin".');
  process.exit(1);
}

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const { data: usersPage, error: listError } = await supabase.auth.admin.listUsers();
if (listError) {
  console.error("Failed to list users:", listError.message);
  process.exit(1);
}

const user = usersPage.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
if (!user) {
  console.error(`No account found for ${email}. They need to register first.`);
  process.exit(1);
}

const { error: updateError } = await supabase.from("profiles").update({ role }).eq("id", user.id);
if (updateError) {
  console.error("Failed to update role:", updateError.message);
  process.exit(1);
}

console.log(`${email} is now "${role}".`);
