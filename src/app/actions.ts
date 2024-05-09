"use server";

import { submitDBFeedback } from "@/utils/supabase/admin";
import { cookies } from "next/headers";

async function submitFeedback(formData: FormData) {
  const feedback = formData.get("feedback");
  if (!feedback) {
    return;
  }

  await submitDBFeedback({ feedback, cookies: cookies().getAll() });
}

export { submitFeedback };
