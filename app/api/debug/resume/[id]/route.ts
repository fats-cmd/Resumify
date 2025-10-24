import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    // Get auth token from cookies or headers
    const cookieStore = await cookies();
    const authToken =
      req.headers.get("authorization")?.replace("Bearer ", "") ||
      cookieStore.get("sb-access-token")?.value;

    if (!authToken) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Create authenticated Supabase client
    const authenticatedSupabase = createClient(
      supabaseUrl,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        },
      },
    );

    // Verify user session
    const {
      data: { user },
      error: userError,
    } = await authenticatedSupabase.auth.getUser(authToken);

    if (userError || !user) {
      return NextResponse.json(
        { error: "Invalid authentication token", details: userError?.message },
        { status: 401 },
      );
    }

    // Convert ID to integer
    const resumeId = parseInt(id);
    if (isNaN(resumeId)) {
      return NextResponse.json(
        { error: "Invalid resume ID format", originalId: id },
        { status: 400 },
      );
    }

    // Check if resume exists for this user
    const { data: resumeList, error: resumeError } = await supabase
      .from("resumes")
      .select("id, title, user_id, created_at, updated_at")
      .eq("id", resumeId)
      .eq("user_id", user.id);

    const resume = resumeList && resumeList.length > 0 ? resumeList[0] : null;

    // Also check if resume exists for any user (debugging)
    const { data: anyResumeList, error: anyResumeError } = await supabase
      .from("resumes")
      .select("id, title, user_id")
      .eq("id", resumeId);

    const anyResume = anyResumeList && anyResumeList.length > 0 ? anyResumeList[0] : null;

    return NextResponse.json({
      debug: {
        originalId: id,
        convertedId: resumeId,
        userId: user.id,
        userEmail: user.email,
      },
      resume: {
        found: !!resume,
        belongsToUser: !!resume,
        error: resumeError?.message,
        data: resume ? {
          id: resume.id,
          title: resume.title,
          user_id: resume.user_id,
          created_at: resume.created_at,
          updated_at: resume.updated_at,
        } : null,
      },
      anyResume: {
        exists: !!anyResume,
        count: anyResumeList?.length || 0,
        actualUserId: anyResume?.user_id,
        error: anyResumeError?.message,
        allUserIds: anyResumeList?.map(r => r.user_id) || [],
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Debug endpoint error",
        message: error instanceof Error ? error.message : "Unknown error",
        details: String(error),
      },
      { status: 500 },
    );
  }
}