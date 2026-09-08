"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isLocale, defaultLocale } from "@/lib/i18n/config";

export type ActionResult = { success: true } | { success: false; error: string };

function getLocale(formData: FormData) {
  const raw = String(formData.get("locale") ?? "");
  return isLocale(raw) ? raw : defaultLocale;
}

async function assertTeacher() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || profile.role !== "teacher") return null;
  return supabase;
}

export async function addTeacherSessionAction(formData: FormData): Promise<ActionResult> {
  const groupId = String(formData.get("groupId") ?? "").trim();
  const scheduledAt = String(formData.get("scheduledAt") ?? "").trim();
  const meetingUrl = String(formData.get("meetingUrl") ?? "").trim();
  const locale = getLocale(formData);

  const supabase = await assertTeacher();
  if (!supabase) return { success: false, error: "generic" };
  if (!groupId || !scheduledAt) return { success: false, error: "missing_fields" };

  const { error } = await supabase.from("class_sessions").insert({
    group_id: groupId,
    scheduled_at: new Date(scheduledAt).toISOString(),
    meeting_url: meetingUrl || null,
  });

  if (error) return { success: false, error: "generic" };

  revalidatePath(`/${locale}/teacher/groups/${groupId}`);
  return { success: true };
}

export async function markAttendanceAction(formData: FormData): Promise<ActionResult> {
  const sessionId = String(formData.get("sessionId") ?? "").trim();
  const groupId = String(formData.get("groupId") ?? "").trim();
  const locale = getLocale(formData);

  const supabase = await assertTeacher();
  if (!supabase) return { success: false, error: "generic" };
  if (!sessionId) return { success: false, error: "missing_fields" };

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const studentIds = formData.getAll("studentId").map(String);
  const rows = studentIds.map((studentId) => ({
    session_id: sessionId,
    student_id: studentId,
    status: String(formData.get(`status_${studentId}`) ?? "present"),
    marked_by: user?.id,
  }));

  if (rows.length === 0) return { success: false, error: "missing_fields" };

  const { error } = await supabase.from("class_attendance").upsert(rows, { onConflict: "session_id,student_id" });
  if (error) return { success: false, error: "generic" };

  revalidatePath(`/${locale}/teacher/groups/${groupId}`);
  return { success: true };
}

export async function addMemorizationAction(formData: FormData): Promise<ActionResult> {
  const studentId = String(formData.get("studentId") ?? "").trim();
  const surahId = Number(formData.get("surahId"));
  const ayahFrom = Number(formData.get("ayahFrom"));
  const ayahTo = Number(formData.get("ayahTo"));
  const status = String(formData.get("status") ?? "new");
  const locale = getLocale(formData);

  const supabase = await assertTeacher();
  if (!supabase) return { success: false, error: "generic" };
  if (!studentId || !surahId || !ayahFrom || !ayahTo) return { success: false, error: "missing_fields" };
  if (ayahTo < ayahFrom) return { success: false, error: "invalid_range" };

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("student_memorization").insert({
    student_id: studentId,
    surah_id: surahId,
    ayah_from: ayahFrom,
    ayah_to: ayahTo,
    status,
    teacher_id: user?.id,
  });

  if (error) return { success: false, error: "generic" };

  revalidatePath(`/${locale}/teacher/students/${studentId}`);
  return { success: true };
}

export async function updateMemorizationAction(formData: FormData): Promise<ActionResult> {
  const id = String(formData.get("id") ?? "").trim();
  const studentId = String(formData.get("studentId") ?? "").trim();
  const surahId = Number(formData.get("surahId"));
  const ayahFrom = Number(formData.get("ayahFrom"));
  const ayahTo = Number(formData.get("ayahTo"));
  const status = String(formData.get("status") ?? "new");
  const locale = getLocale(formData);

  const supabase = await assertTeacher();
  if (!supabase) return { success: false, error: "generic" };
  if (!id || !studentId || !surahId || !ayahFrom || !ayahTo) return { success: false, error: "missing_fields" };
  if (ayahTo < ayahFrom) return { success: false, error: "invalid_range" };

  const { error } = await supabase
    .from("student_memorization")
    .update({ surah_id: surahId, ayah_from: ayahFrom, ayah_to: ayahTo, status })
    .eq("id", id);

  if (error) return { success: false, error: "generic" };

  revalidatePath(`/${locale}/teacher/students/${studentId}`);
  return { success: true };
}

export async function addRevisionAction(formData: FormData): Promise<ActionResult> {
  const studentId = String(formData.get("studentId") ?? "").trim();
  const surahId = Number(formData.get("surahId"));
  const ayahFrom = Number(formData.get("ayahFrom"));
  const ayahTo = Number(formData.get("ayahTo"));
  const revisionType = String(formData.get("revisionType") ?? "recent");
  const qualityRaw = String(formData.get("qualityRating") ?? "").trim();
  const locale = getLocale(formData);

  const supabase = await assertTeacher();
  if (!supabase) return { success: false, error: "generic" };
  if (!studentId || !surahId || !ayahFrom || !ayahTo) return { success: false, error: "missing_fields" };
  if (ayahTo < ayahFrom) return { success: false, error: "invalid_range" };

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const qualityRating = qualityRaw ? Number(qualityRaw) : null;

  const { error } = await supabase.from("student_revision").insert({
    student_id: studentId,
    surah_id: surahId,
    ayah_from: ayahFrom,
    ayah_to: ayahTo,
    revision_type: revisionType,
    quality_rating: qualityRating && qualityRating >= 1 && qualityRating <= 5 ? qualityRating : null,
    teacher_id: user?.id,
  });

  if (error) return { success: false, error: "generic" };

  revalidatePath(`/${locale}/teacher/students/${studentId}`);
  return { success: true };
}

export async function updateRevisionAction(formData: FormData): Promise<ActionResult> {
  const id = String(formData.get("id") ?? "").trim();
  const studentId = String(formData.get("studentId") ?? "").trim();
  const surahId = Number(formData.get("surahId"));
  const ayahFrom = Number(formData.get("ayahFrom"));
  const ayahTo = Number(formData.get("ayahTo"));
  const revisionType = String(formData.get("revisionType") ?? "recent");
  const qualityRaw = String(formData.get("qualityRating") ?? "").trim();
  const locale = getLocale(formData);

  const supabase = await assertTeacher();
  if (!supabase) return { success: false, error: "generic" };
  if (!id || !studentId || !surahId || !ayahFrom || !ayahTo) return { success: false, error: "missing_fields" };
  if (ayahTo < ayahFrom) return { success: false, error: "invalid_range" };

  const qualityRating = qualityRaw ? Number(qualityRaw) : null;

  const { error } = await supabase
    .from("student_revision")
    .update({
      surah_id: surahId,
      ayah_from: ayahFrom,
      ayah_to: ayahTo,
      revision_type: revisionType,
      quality_rating: qualityRating && qualityRating >= 1 && qualityRating <= 5 ? qualityRating : null,
    })
    .eq("id", id);

  if (error) return { success: false, error: "generic" };

  revalidatePath(`/${locale}/teacher/students/${studentId}`);
  return { success: true };
}

export async function addEvaluationAction(formData: FormData): Promise<ActionResult> {
  const studentId = String(formData.get("studentId") ?? "").trim();
  const sessionId = String(formData.get("sessionId") ?? "").trim();
  const memorizationScoreRaw = String(formData.get("memorizationScore") ?? "").trim();
  const tajweedScoreRaw = String(formData.get("tajweedScore") ?? "").trim();
  const revisionScoreRaw = String(formData.get("revisionScore") ?? "").trim();
  const participationScoreRaw = String(formData.get("participationScore") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const locale = getLocale(formData);

  const supabase = await assertTeacher();
  if (!supabase) return { success: false, error: "generic" };
  if (!studentId || !sessionId) return { success: false, error: "missing_fields" };

  const toScore = (raw: string) => {
    const n = raw ? Number(raw) : null;
    return n && n >= 1 && n <= 5 ? n : null;
  };

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("evaluations").insert({
    session_id: sessionId,
    student_id: studentId,
    teacher_id: user?.id,
    memorization_score: toScore(memorizationScoreRaw),
    tajweed_score: toScore(tajweedScoreRaw),
    revision_score: toScore(revisionScoreRaw),
    participation_score: toScore(participationScoreRaw),
    notes: notes || null,
  });

  if (error) return { success: false, error: "generic" };

  revalidatePath(`/${locale}/teacher/students/${studentId}`);
  return { success: true };
}

export async function updateEvaluationAction(formData: FormData): Promise<ActionResult> {
  const id = String(formData.get("id") ?? "").trim();
  const studentId = String(formData.get("studentId") ?? "").trim();
  const sessionId = String(formData.get("sessionId") ?? "").trim();
  const memorizationScoreRaw = String(formData.get("memorizationScore") ?? "").trim();
  const tajweedScoreRaw = String(formData.get("tajweedScore") ?? "").trim();
  const revisionScoreRaw = String(formData.get("revisionScore") ?? "").trim();
  const participationScoreRaw = String(formData.get("participationScore") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const locale = getLocale(formData);

  const supabase = await assertTeacher();
  if (!supabase) return { success: false, error: "generic" };
  if (!id || !studentId || !sessionId) return { success: false, error: "missing_fields" };

  const toScore = (raw: string) => {
    const n = raw ? Number(raw) : null;
    return n && n >= 1 && n <= 5 ? n : null;
  };

  const { error } = await supabase
    .from("evaluations")
    .update({
      session_id: sessionId,
      memorization_score: toScore(memorizationScoreRaw),
      tajweed_score: toScore(tajweedScoreRaw),
      revision_score: toScore(revisionScoreRaw),
      participation_score: toScore(participationScoreRaw),
      notes: notes || null,
    })
    .eq("id", id);

  if (error) return { success: false, error: "generic" };

  revalidatePath(`/${locale}/teacher/students/${studentId}`);
  return { success: true };
}

export async function addTeacherScheduleSlotAction(formData: FormData): Promise<ActionResult> {
  const groupId = String(formData.get("groupId") ?? "").trim();
  const weekday = Number(formData.get("weekday"));
  const startTime = String(formData.get("startTime") ?? "").trim();
  const endTime = String(formData.get("endTime") ?? "").trim();
  const locale = getLocale(formData);

  const supabase = await assertTeacher();
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

  revalidatePath(`/${locale}/teacher/groups/${groupId}`);
  revalidatePath(`/${locale}/schedule`);
  return { success: true };
}

export async function deleteTeacherScheduleSlotAction(formData: FormData): Promise<ActionResult> {
  const slotId = String(formData.get("slotId") ?? "").trim();
  const groupId = String(formData.get("groupId") ?? "").trim();
  const locale = getLocale(formData);

  const supabase = await assertTeacher();
  if (!supabase) return { success: false, error: "generic" };
  if (!slotId) return { success: false, error: "missing_fields" };

  const { error } = await supabase.from("group_schedule_slots").delete().eq("id", slotId);
  if (error) return { success: false, error: "generic" };

  revalidatePath(`/${locale}/teacher/groups/${groupId}`);
  revalidatePath(`/${locale}/schedule`);
  return { success: true };
}

export async function addWeeklyReportAction(formData: FormData): Promise<ActionResult> {
  const studentId = String(formData.get("studentId") ?? "").trim();
  const weekStart = String(formData.get("weekStart") ?? "").trim();
  const weekEnd = String(formData.get("weekEnd") ?? "").trim();
  const sessionsAttended = Number(formData.get("sessionsAttended") ?? 0);
  const sessionsTotal = Number(formData.get("sessionsTotal") ?? 0);
  const newAyahs = Number(formData.get("newAyahsMemorized") ?? 0);
  const revisionScoreRaw = String(formData.get("revisionScore") ?? "").trim();
  const tajweedScoreRaw = String(formData.get("tajweedScore") ?? "").trim();
  const teacherNotes = String(formData.get("teacherNotes") ?? "").trim();
  const nextWeekGoals = String(formData.get("nextWeekGoals") ?? "").trim();
  const locale = getLocale(formData);

  const supabase = await assertTeacher();
  if (!supabase) return { success: false, error: "generic" };
  if (!studentId || !weekStart || !weekEnd) return { success: false, error: "missing_fields" };

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("weekly_reports").upsert(
    {
      student_id: studentId,
      week_start: weekStart,
      week_end: weekEnd,
      sessions_attended: Number.isFinite(sessionsAttended) ? sessionsAttended : 0,
      sessions_total: Number.isFinite(sessionsTotal) ? sessionsTotal : 0,
      new_ayahs_memorized: Number.isFinite(newAyahs) ? newAyahs : 0,
      revision_score: revisionScoreRaw ? Number(revisionScoreRaw) : null,
      tajweed_score: tajweedScoreRaw ? Number(tajweedScoreRaw) : null,
      teacher_notes: teacherNotes || null,
      next_week_goals: nextWeekGoals || null,
      generated_by: user?.id,
      sent_at: new Date().toISOString(),
    },
    { onConflict: "student_id,week_start" }
  );

  if (error) return { success: false, error: "generic" };

  revalidatePath(`/${locale}/teacher/students/${studentId}`);
  revalidatePath(`/${locale}/dashboard`);
  return { success: true };
}
