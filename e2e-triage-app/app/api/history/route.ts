import { NextResponse } from 'next/server';
import { getDb } from '../db';

export async function GET() {
  try {
    const db = getDb();
    
    // Calculate bug percentages
    const analyses = Object.values(db.analyses);
    let totalBugs = 0;
    let totalFlaky = 0;

    analyses.forEach(a => {
      if (a.isBug) totalBugs++;
      if (a.isFlaky) totalFlaky++;
    });

    return NextResponse.json({
      runs: db.runs,
      aiStats: {
        totalAnalyzed: analyses.length,
        totalBugs,
        totalFlaky
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
