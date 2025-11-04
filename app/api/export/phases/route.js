import { NextResponse } from 'next/server';
import { apiHandler } from '@/lib/apiHandler';
import { getUserFromRequest } from '@/lib/auth';
import { exportPhases } from '@/lib/exportService';

async function handler(request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ ok: false, error: { message: 'Unauthorized' } }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format') || 'pdf';
  const projectId = searchParams.get('projectId');

  try {
    if (format === 'pdf') {
      const doc = await exportPhases(user.companyId, projectId, 'pdf');
      const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="phases-report.pdf"',
        },
      });
    } else if (format === 'csv') {
      const csvContent = await exportPhases(user.companyId, projectId, 'csv');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="phases-report.csv"',
        },
      });
    } else {
      return NextResponse.json({ ok: false, error: { message: 'Invalid format' } }, { status: 400 });
    }
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ ok: false, error: { message: error.message } }, { status: 500 });
  }
}

export const GET = apiHandler(handler);
