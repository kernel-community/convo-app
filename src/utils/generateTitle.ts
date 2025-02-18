import { KERNEL_SMOLBRAIN_API, KERNEL_SMOLBRAIN_APP_NAME } from "./constants";

interface SmolbrainResponse {
  data: {
    prompt: string;
    response: string;
  };
}

interface GenerateTitleResponse {
  title: string;
}

export async function generateTitle(
  description?: string
): Promise<GenerateTitleResponse> {
  if (!description?.trim()) {
    return { title: "Untitled Convo" };
  }

  try {
    const response = await fetch(
      `${KERNEL_SMOLBRAIN_API}/action/convo/generate-title`,
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
      title: data.response,
    };
  } catch (error) {
    console.error("Error generating title:", error);
    // Fallback to a simple title
    return {
      title: description?.split("\n")?.[0]?.slice(0, 40) || "Untitled Convo",
    };
  }
}
