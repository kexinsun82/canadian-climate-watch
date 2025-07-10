import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../lib/mongodb";

export async function GET() {
  try {
    const client = await connectToDatabase();
    const db = client.db(process.env.DB_NAME);

    const discussions = await db.collection("discussions")
      .find({})
      .sort({ date: -1 })
      .toArray();

    return NextResponse.json(discussions);
  } catch (error) {
    console.error("Failed to fetch discussions:", error);
    return NextResponse.json({ message: "Error fetching discussions" }, { status: 500 });
  }
}