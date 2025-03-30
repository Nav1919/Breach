import { NextRequest, NextResponse } from 'next/server';
import { BigQuery } from '@google-cloud/bigquery';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query') || '';
  const domains = searchParams.get('domains');
  const limit = searchParams.get('limit') || '10';
  const bigQuery = new BigQuery({
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  });
  let domainFilter = '';
  if (domains) {
    const domainArray = domains.split(',');
    const cpcFilters = domainArray.map(domain => {
      if (domain === 'ai') return "code LIKE 'G06N3%'";
      if (domain === 'medical') return "code LIKE 'A61B5%'";
      return null;
    }).filter(Boolean);
    if (cpcFilters.length > 0) {
      domainFilter = `AND EXISTS(SELECT 1 FROM UNNEST(cpc) WHERE ${cpcFilters.join(' OR ')})`;
    }
  }
  let textFilter = '';
  if (query && query.trim() !== '') {
    textFilter = `AND (
      (SELECT text FROM UNNEST(title_localized) WHERE language = 'en' LIMIT 1) LIKE '%${query}%'
      OR (SELECT text FROM UNNEST(abstract_localized) WHERE language = 'en' LIMIT 1) LIKE '%${query}%'
    )`;
  }
  const sqlQuery = `
    SELECT
      publication_number,
      publication_date,
      country_code,
      (SELECT text FROM UNNEST(title_localized) WHERE language = 'en' LIMIT 1) as title,
      (SELECT text FROM UNNEST(abstract_localized) WHERE language = 'en' LIMIT 1) as abstract,
      ARRAY(SELECT code FROM UNNEST(cpc)) as cpc_codes
    FROM
      \`patents-public-data.patents.publications\`
    WHERE
      publication_date >= 20180101
      AND country_code = 'US'
      ${textFilter}
      ${domainFilter}
    LIMIT ${limit};
  `;
  try {
    const [rows] = await bigQuery.query(sqlQuery);
    const patents = rows.map((row: any) => ({
      id: row.publication_number,
      title: row.title || '',
      abstract: row.abstract || '',
      date: row.publication_date,
      cpc_codes: row.cpc_codes || [],
      domain: getDomain(row.cpc_codes || [])
    }));
    
    return NextResponse.json({ success: true, data: patents });
  } catch (error) {
    console.error('Error querying BigQuery:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch patent data' },
      { status: 500 }
    );
  }
}

function getDomain(cpcCodes: string[]): string {
  if (cpcCodes.some(code => code.startsWith('G06N3'))) {
    return 'AI/Neural Networks';
  } else if (cpcCodes.some(code => code.startsWith('A61B5'))) {
    return 'Medical Measurement';
  } else {
    return 'Other';
  }
}