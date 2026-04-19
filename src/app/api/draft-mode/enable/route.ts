import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const destination = searchParams.get("redirect") ?? "/";
  const secret = searchParams.get("secret");

  const expectedSecret = process.env.SANITY_PREVIEW_SECRET;

  if (expectedSecret) {
    if (secret !== expectedSecret) {
      return new Response("Unauthorized", { status: 401 });
    }
  } else {
    // No secret configured — allow but warn so operators notice in logs.
    console.warn(
      "[draft-mode] SANITY_PREVIEW_SECRET is not set. " +
        "Anyone can enable draft mode. Set the env var to restrict access.",
    );
  }

  const draft = await draftMode();
  draft.enable();

  redirect(destination);
}
