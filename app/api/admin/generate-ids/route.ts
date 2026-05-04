import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();

  // Solo ADMIN puede ejecutar esto (Seguridad total)
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { playerId: null },
          { playerId: "" },
          { playerId: { equals: undefined as any } }
        ]
      }
    });

    const results = [];

    for (const user of users) {
      let uniqueId = "";
      let isUnique = false;

      while (!isUnique) {
        uniqueId = Math.floor(100000 + Math.random() * 900000).toString();
        const existing = await prisma.user.findUnique({
          where: { playerId: uniqueId }
        });
        if (!existing) isUnique = true;
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { playerId: uniqueId }
      });
      results.push({ email: user.email, playerId: uniqueId });
    }

    return NextResponse.json({ 
      success: true, 
      message: `IDs generados para ${users.length} usuarios.`,
      details: results 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
