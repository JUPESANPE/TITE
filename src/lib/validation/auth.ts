import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(1, "Falta el nombre").max(100),
  email: z.string().trim().toLowerCase().email("Email inválido"),
  password: z.string().min(8, "La contraseña necesita al menos 8 caracteres").max(200),
});
