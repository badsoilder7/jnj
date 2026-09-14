import { z } from "zod";
export const shopEditSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  nameTe: z.string().trim().max(100).optional(),
  description: z.string().trim().max(600).optional(),
  descriptionTe: z.string().trim().max(600).optional(),
  address: z.string().trim().min(5).max(300).optional(),
  locality: z.string().trim().min(2).max(100).optional(),
  landmark: z.string().trim().max(150).optional(),
  hours: z.string().trim().max(150).optional(),
  category: z
    .enum([
      "Footwear",
      "Clothing",
      "Mobiles",
      "Groceries",
      "Hardware",
      "Home essentials",
      "Stationery",
      "Services",
    ])
    .optional(),
  phone: z
    .string()
    .regex(/^\+[1-9][0-9]{9,14}$/)
    .or(z.literal(""))
    .optional(),
  whatsapp: z
    .string()
    .regex(/^[1-9][0-9]{9,14}$/)
    .or(z.literal(""))
    .optional(),
  tags: z.array(z.string().trim().min(1).max(50)).max(30).optional(),
  photo: z
    .string()
    .max(4500000)
    .regex(/^data:image\/(jpeg|png|webp);base64,/)
    .optional(),
});

// A plain 10-digit local number is Indian; explicit international codes are preserved.
export function normalizeContact(value: string, whatsapp = false) {
  const compact = value.replace(/[\s()-]/g, "");
  if (!compact) return "";
  if (!/^\+?[0-9]+$/.test(compact)) return compact;
  let digits = compact.replace(/^\+/, "");
  if (digits.length === 10 && !compact.startsWith("+")) digits = `91${digits}`;
  return whatsapp ? digits : `+${digits}`;
}
