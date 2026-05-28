import { NextRequest, NextResponse } from "next/server";

// Mocking Prisma Client-style database actions for high compatibility and testability
const db = {
  user: {
    findMany: async ({ skip, take }: { skip: number; take: number }) => {
      const mockUsers = Array.from({ length: 150 }, (_, i) => ({
        id: i + 1,
        name: `User ${i + 1}`,
        email: `user${i + 1}@example.com`,
        role: i % 5 === 0 ? "admin" : "member",
        createdAt: new Date(Date.now() - i * 3600000).toISOString(),
      }));
      return mockUsers.slice(skip, skip + take);
    },
    count: async () => {
      return 150;
    },
  },
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    // Clamp values to prevent malicious parameters
    const parsedPage = isNaN(page) || page < 1 ? 1 : page;
    const parsedLimit = isNaN(limit) || limit < 1 ? 10 : limit;

    const skip = (parsedPage - 1) * parsedLimit;

    // Run DB queries in parallel for high performance
    const [records, count] = await Promise.all([
      db.user.findMany({
        skip,
        take: parsedLimit,
      }),
      db.user.count(),
    ]);

    // Step 3: Format Response matching specifications exactly
    return NextResponse.json({
      data: records,
      meta: {
        totalRecords: count,
        totalPages: Math.ceil(count / parsedLimit),
        currentPage: parsedPage,
        limit: parsedLimit,
      },
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
