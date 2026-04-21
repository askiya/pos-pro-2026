"use server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getProducts() {
  try {
    return await prisma.product.findMany({
      include: { category: true }
    });
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return [];
  }
}
