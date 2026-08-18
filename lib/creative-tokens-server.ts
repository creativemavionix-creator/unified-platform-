import { cookies } from "next/headers";
import {
  buildBalance,
  DAILY_TOKEN_LIMIT,
  todayKey,
  type TokenBalance,
} from "./creative-tokens";
import { createSupabaseServerClient } from "./supabase-server";

const DEMO_COOKIE = "mvx_creative_demo_id";

async function getDemoUserKey(): Promise<string> {
  const cookieStore = await cookies();
  let demoId = cookieStore.get(DEMO_COOKIE)?.value;
  if (!demoId) {
    demoId = `demo-${crypto.randomUUID()}`;
    cookieStore.set(DEMO_COOKIE, demoId, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }
  return demoId;
}

async function resolveUserKey(): Promise<{ userKey: string; isDemo: boolean }> {
  const supabase = await createSupabaseServerClient();
  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) return { userKey: user.id, isDemo: false };
  }
  return { userKey: await getDemoUserKey(), isDemo: true };
}

async function readDemoUsage(userKey: string): Promise<number> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(`mvx_tokens_${todayKey()}_${userKey}`)?.value;
  return raw ? Number(raw) || 0 : 0;
}

async function writeDemoUsage(userKey: string, used: number): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(`mvx_tokens_${todayKey()}_${userKey}`, String(used), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
}

export async function getServerTokenBalance(): Promise<TokenBalance & { isDemo: boolean }> {
  const { userKey, isDemo } = await resolveUserKey();

  if (isDemo) {
    const used = await readDemoUsage(userKey);
    return { ...buildBalance(used), isDemo: true };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    const used = await readDemoUsage(userKey);
    return { ...buildBalance(used), isDemo: true };
  }

  const { data } = await supabase
    .from("user_daily_tokens")
    .select("tokens_used")
    .eq("user_id", userKey)
    .eq("date", todayKey())
    .maybeSingle();

  return { ...buildBalance(data?.tokens_used ?? 0), isDemo: false };
}

export async function deductServerTokens(
  cost: number
): Promise<{ ok: boolean; error?: string; balance: TokenBalance }> {
  if (cost <= 0) {
    const balance = await getServerTokenBalance();
    return { ok: true, balance };
  }

  const { userKey, isDemo } = await resolveUserKey();

  if (isDemo) {
    const used = await readDemoUsage(userKey);
    const balance = buildBalance(used);
    if (cost > balance.remaining) {
      return {
        ok: false,
        error: `Not enough generation credits. You need ${cost} but only have ${balance.remaining} remaining today.`,
        balance,
      };
    }
    const nextUsed = used + cost;
    await writeDemoUsage(userKey, nextUsed);
    return { ok: true, balance: buildBalance(nextUsed) };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    const used = await readDemoUsage(userKey);
    const balance = buildBalance(used);
    if (cost > balance.remaining) {
      return {
        ok: false,
        error: `Not enough generation credits. You need ${cost} but only have ${balance.remaining} remaining today.`,
        balance,
      };
    }
    await writeDemoUsage(userKey, used + cost);
    return { ok: true, balance: buildBalance(used + cost) };
  }

  const { data: existing } = await supabase
    .from("user_daily_tokens")
    .select("id, tokens_used")
    .eq("user_id", userKey)
    .eq("date", todayKey())
    .maybeSingle();

  const used = existing?.tokens_used ?? 0;
  const remaining = Math.max(0, DAILY_TOKEN_LIMIT - used);
  if (cost > remaining) {
    return {
      ok: false,
      error: `Not enough generation credits. You need ${cost} but only have ${remaining} remaining today.`,
      balance: buildBalance(used),
    };
  }

  const nextUsed = used + cost;
  if (existing?.id) {
    await supabase
      .from("user_daily_tokens")
      .update({ tokens_used: nextUsed })
      .eq("id", existing.id);
  } else {
    await supabase.from("user_daily_tokens").insert({
      user_id: userKey,
      date: todayKey(),
      tokens_used: nextUsed,
    });
  }

  return { ok: true, balance: buildBalance(nextUsed) };
}
