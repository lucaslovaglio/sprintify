import { NextRequest } from "next/server";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { PsaCardAiSchema } from "@/lib/schema";
import { buildPrompt } from "@/lib/prompt";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return Response.json(
        { error: "image_not_supported", reason: "OpenAI API key not configured" },
        { status: 500 },
      );
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return Response.json(
        { error: "image_not_supported", reason: "Missing 'file' or invalid file" },
        { status: 400 },
      );
    }

    const mimetype = file.type || "";
    const supported =
      mimetype.startsWith("image/") || mimetype === "application/pdf";
    if (!supported) {
      return Response.json(
        { error: "image_not_supported", reason: `Unsupported mimetype: ${mimetype}` },
        { status: 415 },
      );
    }

    const arrayBuf = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuf).toString("base64");

    const prompt = buildPrompt();

    // Elegí tu modelo multimodal (p. ej., gpt-4o-mini). Podés cambiarlo luego.
    const model = openai("gpt-4o-mini");

    console.log("request a OpenAI...");
    console.log("Prompt:", prompt.substring(0, 100) + "...");
    console.log("File:", file.name, "Size:", file.size, "Type:", mimetype);

    const { object, warnings } = await generateObject({
      model,
      schema: PsaCardAiSchema,
      messages: [
        {
          role: "system" as const,
          content: prompt,
        },
        {
          role: "user" as const,
          content: [
            { type: "image" as const, image: `data:${mimetype};base64,${base64}` }
          ],
        },
      ],
    });

    console.log("Respuesta de OpenAI recibida:", object);
    if (warnings) console.warn("Warnings:", warnings);

    const result = {
      ...object,
      card: object.card || {},
      source: {
        filename: file.name,
        mimetype,
        size: file.size,
      },
    };

    if (!result.isPSA) {
      return Response.json(
        { error: "image_not_supported", reason: result.reason || "Not a PSA NBA card" },
        { status: 400 },
      );
    }

    return Response.json(result, { status: 200 });
  } catch (e: any) {

    console.error("Error completo:", e);
    console.error("Mensaje:", e?.message);
    console.error("Stack:", e?.stack);
    
    let errorMessage = e?.message || "Unknown error";
    
    // Errores comunes de OpenAI
    if (e?.status === 401 || errorMessage.includes("Incorrect API key")) {
      errorMessage = "Invalid OpenAI API key. Please check your OPENAI_API_KEY in .env.local";
    } else if (e?.status === 429 || errorMessage.includes("quota") || errorMessage.includes("rate limit")) {
      errorMessage = "OpenAI API quota exceeded or rate limit reached. Check your account credits.";
    } else if (errorMessage.includes("response did not match schema")) {
      errorMessage = "AI response format error: " + errorMessage;
    }
    
    return Response.json(
      { error: "image_not_supported", reason: errorMessage },
      { status: 500 },
    );
  }
}