"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { isLocale, defaultLocale } from "@/lib/i18n/config";

export type ActionResult = { success: true } | { success: false; error: string };

function getLocale(formData: FormData) {
  const raw = String(formData.get("locale") ?? "");
  return isLocale(raw) ? raw : defaultLocale;
}

async function assertAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || (profile.role !== "admin" && profile.role !== "super_admin")) return null;
  return supabase;
}

export async function addTeacherAction(formData: FormData): Promise<ActionResult> {
  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const tempPassword = String(formData.get("tempPassword") ?? "");
  const locale = getLocale(formData);

  const supabase = await assertAdmin();
  if (!supabase) return { success: false, error: "generic" };

  if (!fullName || !email || tempPassword.length < 8) return { success: false, error: "missing_fields" };

  const serviceRole = createServiceRoleClient();

  const { data: created, error: createError } = await serviceRole.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { full_name: fullName, locale },
  });

  if (createError || !created.user) {
    return { success: false, error: "generic" };
  }

  // handle_new_user always inserts role='parent' — elevate to teacher and
  // add the teachers extension row. Both bypass RLS via service role since
  // this is a trusted, admin-triggered server-side operation.
  const { error: roleError } = await serviceRole.from("profiles").update({ role: "teacher" }).eq("id", created.user.id);
  if (roleError) return { success: false, error: "generic" };

  const { error: teacherRowError } = await serviceRole.from("teachers").insert({ id: created.user.id });
  if (teacherRowError) return { success: false, error: "generic" };

  revalidatePath(`/${locale}/admin/teachers`);
  redirect(`/${locale}/admin/teachers`);
}

export async function deleteTeacherAction(formData: FormData): Promise<ActionResult> {
  const teacherId = String(formData.get("teacherId") ?? "").trim();
  const locale = getLocale(formData);

  const supabase = await assertAdmin();
  if (!supabase) return { success: false, error: "generic" };
  if (!teacherId) return { success: false, error: "missing_fields" };

  const serviceRole = createServiceRoleClient();
  const { error } = await serviceRole.auth.admin.deleteUser(teacherId);
  if (error) return { success: false, error: "generic" };

  revalidatePath(`/${locale}/admin/teachers`);
  revalidatePath(`/${locale}/admin/groups`);
  return { success: true };
}

export async function deleteStudentAction(formData: FormData): Promise<ActionResult> {
  const studentId = String(formData.get("studentId") ?? "").trim();
  const locale = getLocale(formData);

  const supabase = await assertAdmin();
  if (!supabase) return { success: false, error: "generic" };
  if (!studentId) return { success: false, error: "missing_fields" };

  const { error } = await supabase.from("students").delete().eq("id", studentId);
  if (error) return { success: false, error: "generic" };

  revalidatePath(`/${locale}/admin/students`);
  return { success: true };
}

export async function createGroupAction(formData: FormData): Promise<ActionResult> {
  const name = String(formData.get("name") ?? "").trim();
  const programId = String(formData.get("programId") ?? "").trim();
  const levelId = String(formData.get("levelId") ?? "").trim();
  const teacherId = String(formData.get("teacherId") ?? "").trim();
  const maqraaId = String(formData.get("maqraaId") ?? "").trim();
  const capacityRaw = String(formData.get("capacity") ?? "").trim();
  const locale = getLocale(formData);

  const supabase = await assertAdmin();
  if (!supabase) return { success: false, error: "generic" };

  if (!name) return { success: false, error: "missing_fields" };

  const capacity = capacityRaw ? Number(capacityRaw) : 8;

  const { error } = await supabase.from("groups").insert({
    name,
    program_id: programId || null,
    level_id: levelId || null,
    teacher_id: teacherId || null,
    maqraa_id: maqraaId || null,
    capacity: Number.isFinite(capacity) && capacity > 0 ? capacity : 8,
  });

  if (error) return { success: false, error: "generic" };

  revalidatePath(`/${locale}/admin/groups`);
  redirect(`/${locale}/admin/groups`);
}

export async function createMaqraaAction(formData: FormData): Promise<ActionResult> {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const locale = getLocale(formData);

  const supabase = await assertAdmin();
  if (!supabase) return { success: false, error: "generic" };
  if (!name) return { success: false, error: "missing_fields" };

  const { error } = await supabase.from("maqraas").insert({
    name,
    description: description || null,
  });

  if (error) return { success: false, error: "generic" };

  revalidatePath(`/${locale}/admin/maqraas`);
  redirect(`/${locale}/admin/maqraas`);
}

export async function deleteMaqraaAction(formData: FormData): Promise<ActionResult> {
  const maqraaId = String(formData.get("maqraaId") ?? "").trim();
  const locale = getLocale(formData);

  const supabase = await assertAdmin();
  if (!supabase) return { success: false, error: "generic" };
  if (!maqraaId) return { success: false, error: "missing_fields" };

  const { error } = await supabase.from("maqraas").delete().eq("id", maqraaId);
  if (error) return { success: false, error: "generic" };

  revalidatePath(`/${locale}/admin/maqraas`);
  revalidatePath(`/${locale}/admin/groups`);
  return { success: true };
}

export async function assignStudentGroupAction(formData: FormData): Promise<ActionResult> {
  const studentId = String(formData.get("studentId") ?? "").trim();
  const groupId = String(formData.get("groupId") ?? "").trim();
  const locale = getLocale(formData);

  const supabase = await assertAdmin();
  if (!supabase) return { success: false, error: "generic" };
  if (!studentId) return { success: false, error: "missing_fields" };

  const { error } = await supabase
    .from("students")
    .update({
      group_id: groupId || null,
      enrollment_status: groupId ? "active" : "lead",
    })
    .eq("id", studentId);

  if (error) return { success: false, error: "generic" };

  revalidatePath(`/${locale}/admin/students`);
  return { success: true };
}

export async function addSessionAction(formData: FormData): Promise<ActionResult> {
  const groupId = String(formData.get("groupId") ?? "").trim();
  const scheduledAt = String(formData.get("scheduledAt") ?? "").trim();
  const meetingUrl = String(formData.get("meetingUrl") ?? "").trim();
  const locale = getLocale(formData);

  const supabase = await assertAdmin();
  if (!supabase) return { success: false, error: "generic" };
  if (!groupId || !scheduledAt) return { success: false, error: "missing_fields" };

  const { error } = await supabase.from("class_sessions").insert({
    group_id: groupId,
    scheduled_at: new Date(scheduledAt).toISOString(),
    meeting_url: meetingUrl || null,
  });

  if (error) return { success: false, error: "generic" };

  revalidatePath(`/${locale}/admin/groups/${groupId}`);
  return { success: true };
}

export async function deleteSessionAction(formData: FormData): Promise<ActionResult> {
  const sessionId = String(formData.get("sessionId") ?? "").trim();
  const groupId = String(formData.get("groupId") ?? "").trim();
  const locale = getLocale(formData);

  const supabase = await assertAdmin();
  if (!supabase) return { success: false, error: "generic" };
  if (!sessionId) return { success: false, error: "missing_fields" };

  const { error } = await supabase.from("class_sessions").delete().eq("id", sessionId);
  if (error) return { success: false, error: "generic" };

  revalidatePath(`/${locale}/admin/groups/${groupId}`);
  return { success: true };
}

export async function addScheduleSlotAction(formData: FormData): Promise<ActionResult> {
  const groupId = String(formData.get("groupId") ?? "").trim();
  const weekday = Number(formData.get("weekday"));
  const startTime = String(formData.get("startTime") ?? "").trim();
  const endTime = String(formData.get("endTime") ?? "").trim();
  const locale = getLocale(formData);

  const supabase = await assertAdmin();
  if (!supabase) return { success: false, error: "generic" };
  if (!groupId || !startTime || !endTime || !Number.isInteger(weekday) || weekday < 0 || weekday > 6) {
    return { success: false, error: "missing_fields" };
  }

  const { error } = await supabase.from("group_schedule_slots").insert({
    group_id: groupId,
    weekday,
    start_time: startTime,
    end_time: endTime,
  });

  if (error) return { success: false, error: "generic" };

  revalidatePath(`/${locale}/admin/groups/${groupId}`);
  revalidatePath(`/${locale}/schedule`);
  return { success: true };
}

export async function deleteScheduleSlotAction(formData: FormData): Promise<ActionResult> {
  const slotId = String(formData.get("slotId") ?? "").trim();
  const groupId = String(formData.get("groupId") ?? "").trim();
  const locale = getLocale(formData);

  const supabase = await assertAdmin();
  if (!supabase) return { success: false, error: "generic" };
  if (!slotId) return { success: false, error: "missing_fields" };

  const { error } = await supabase.from("group_schedule_slots").delete().eq("id", slotId);
  if (error) return { success: false, error: "generic" };

  revalidatePath(`/${locale}/admin/groups/${groupId}`);
  revalidatePath(`/${locale}/schedule`);
  return { success: true };
}

export async function addStudentAction(formData: FormData): Promise<ActionResult> {
  const parentMode = String(formData.get("parentMode") ?? "existing");
  const parentEmail = String(formData.get("parentEmail") ?? "").trim();
  const parentFullName = String(formData.get("parentFullName") ?? "").trim();
  const parentTempPassword = String(formData.get("parentTempPassword") ?? "");
  const childName = String(formData.get("childName") ?? "").trim();
  const dateOfBirth = String(formData.get("dateOfBirth") ?? "").trim();
  const gender = String(formData.get("gender") ?? "").trim();
  const locale = getLocale(formData);

  const supabase = await assertAdmin();
  if (!supabase) return { success: false, error: "generic" };

  if (!parentEmail || !childName || !dateOfBirth) return { success: false, error: "missing_fields" };
  if (parentMode === "new" && (!parentFullName || parentTempPassword.length < 8)) {
    return { success: false, error: "missing_fields" };
  }

  const serviceRole = createServiceRoleClient();

  let parentId: string;

  const { data: usersPage, error: listError } = await serviceRole.auth.admin.listUsers();
  if (listError) return { success: false, error: "generic" };
  const existing = usersPage.users.find((u) => u.email?.toLowerCase() === parentEmail.toLowerCase());

  if (existing) {
    parentId = existing.id;
  } else {
    if (parentMode === "existing") {
      // Admin expected this parent to already exist but no account matches.
      return { success: false, error: "parent_not_found" };
    }
    const { data: created, error: createError } = await serviceRole.auth.admin.createUser({
      email: parentEmail,
      password: parentTempPassword,
      email_confirm: true,
      user_metadata: { full_name: parentFullName, locale },
    });
    if (createError || !created.user) {
      if (createError?.code === "email_exists") return { success: false, error: "email_in_use" };
      return { success: false, error: "generic" };
    }
    parentId = created.user.id;
  }

  const studentId = crypto.randomUUID();
  const { error: studentError } = await serviceRole.from("students").insert({
    id: studentId,
    full_name: childName,
    date_of_birth: dateOfBirth,
    gender: gender === "male" || gender === "female" ? gender : null,
  });
  if (studentError) return { success: false, error: "generic" };

  const { error: linkError } = await serviceRole.from("parent_children").insert({
    parent_id: parentId,
    student_id: studentId,
  });
  if (linkError) {
    await serviceRole.from("students").delete().eq("id", studentId);
    return { success: false, error: "generic" };
  }

  revalidatePath(`/${locale}/admin/students`);
  redirect(`/${locale}/admin/students`);
}
