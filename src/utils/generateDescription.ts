import { KERNEL_SMOLBRAIN_API, KERNEL_SMOLBRAIN_APP_NAME } from "./constants";

interface SmolbrainResponse {
  data: {
    prompt: string;
    response: string;
  };
}

interface GenerateDescriptionResponse {
  description: string;
}

export async function generateDescription(
  description?: string
): Promise<GenerateDescriptionResponse> {
  if (!description?.trim()) {
    return { description: "Convo" };
  }

  try {
    const response = await fetch(
      `${KERNEL_SMOLBRAIN_API}/action/convo/generate-description`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ask: description,
          app: KERNEL_SMOLBRAIN_APP_NAME,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = ((await response.json()) as SmolbrainResponse).data;
    return {
      description: data.response,
    };
  } catch (error) {
    console.error("Error generating description:", error);
    // Fallback to a simple title
    return {
      description: description?.split("\n")?.[0]?.slice(0, 40) || "Convo",
    };
  }
}
