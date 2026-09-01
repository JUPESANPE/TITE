import { prisma } from "@/data/prisma";
import type { GarmentCategory } from "@/domain/wardrobe/garment.types";

export async function listWardrobe(userId: string) {
  return prisma.wardrobeItem.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
}

export async function getWardrobeItem(userId: string, id: string) {
  // Filtrar SIEMPRE por userId además del id: nunca confiar en que un id
  // "parece" válido — así se evita que el usuario A lea/edite prendas del
  // usuario B por más que adivine el id (PRODUCT.md punto 11).
  return prisma.wardrobeItem.findFirst({ where: { id, userId } });
}

export interface CreateWardrobeItemInput {
  imageUrl: string;
  thumbnailUrl?: string;
  category: GarmentCategory;
  name?: string;
  subcategory?: string;
  primaryColor?: string;
  secondaryColors?: string[];
  brand?: string;
  warmth?: number;
  formality?: number;
  fit?: string;
  styles?: string[];
  season?: string[];
  material?: string;
  price?: number;
  aiClassified?: boolean;
}

export async function createWardrobeItem(userId: string, data: CreateWardrobeItemInput) {
  return prisma.wardrobeItem.create({ data: { ...data, userId } });
}

export async function updateWardrobeItem(
  userId: string,
  id: string,
  data: Partial<CreateWardrobeItemInput> & { favorite?: boolean; aiConfirmed?: boolean },
) {
  // updateMany en vez de update: si el id no pertenece a userId, count queda
  // en 0 en lugar de lanzar/editar el registro de otro usuario.
  const result = await prisma.wardrobeItem.updateMany({ where: { id, userId }, data });
  return result.count > 0;
}

export async function deleteWardrobeItem(userId: string, id: string) {
  const result = await prisma.wardrobeItem.deleteMany({ where: { id, userId } });
  return result.count > 0;
}

export async function markWorn(userId: string, ids: string[], when: Date) {
  await prisma.wardrobeItem.updateMany({
    where: { id: { in: ids }, userId },
    data: { lastWornAt: when },
  });
}

export async function countByCategory(userId: string): Promise<Record<string, number>> {
  const rows = await prisma.wardrobeItem.groupBy({
    by: ["category"],
    where: { userId },
    _count: true,
  });
  return Object.fromEntries(rows.map((r) => [r.category, r._count]));
}
