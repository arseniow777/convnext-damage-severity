const BASE_URL = import.meta.env.VITE_API_URL;

export async function predictDamage(file: File) {
  const form = new FormData();
  form.append("image", file);

  const res = await fetch(`${BASE_URL}/predict`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) throw new Error("Prediction failed");
  return res.json() as Promise<{
    label: string;
    confidence: number;
    probabilities: {
      severe_damage: number;
      mild_damage: number;
      little_or_no_damage: number;
    };
  }>;
}
