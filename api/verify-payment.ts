import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.MAYAR_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ valid: false, error: "Missing MAYAR_API_KEY" });
  }

  try {
    const trxId = req.body?.trxId as string | undefined;

    if (trxId) {
      const r = await fetch(`https://api.mayar.id/hl/v1/invoice/${trxId}`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      const data = await r.json();
      const invoice = data?.data || data;
      const paid = invoice?.status === "paid";
      return res.json({ valid: paid });
    }

    const r = await fetch("https://api.mayar.id/hl/v1/invoice?page=1&pageSize=10&sortBy=createdAt&sortDir=desc", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const data = await r.json();
    const invoices: any[] = data?.data || [];
    const paid = invoices.some(
      (inv) =>
        inv.status === "paid" &&
        (inv.name?.toLowerCase().includes("finansialku") ||
          inv.description?.toLowerCase().includes("finansialku") ||
          inv.amount === 15000)
    );

    return res.json({ valid: paid });
  } catch {
    return res.status(500).json({ valid: false });
  }
}
