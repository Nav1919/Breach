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
  
  // Build domain filter
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
  
  // Function to execute the query with retries
  const executeQuery = async (queryText: string, maxRetries = 2) => {
    let attempts = 0;
    let lastError;
    
    while (attempts < maxRetries) {
      try {
        const [rows] = await bigQuery.query(queryText);
        return rows; // Success
      } catch (error) {
        lastError = error;
        console.error(`Query attempt ${attempts + 1} failed:`, error);
        attempts++;
        
        // If it's a syntax error, try with a simplified query next time
        if ((error as Error).message && (error as Error).message.includes('Syntax error')) {
          // For the next attempt, build a safer query
          return await executeFallbackQuery();
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // All attempts failed
    throw lastError;
  };
  
  // Fallback query function for when the main query fails
  const executeFallbackQuery = async () => {
    console.log("Executing fallback query without text search");
    const fallbackQuery = `
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
        ${domainFilter}
      LIMIT ${limit};
    `;
    
    const [rows] = await bigQuery.query(fallbackQuery);
    return rows;
  };
  
  try {
    // Sanitize query text to remove problematic characters
    const sanitizedQuery = query.replace(/['"`\\]/g, " ").trim();
    
    // Build text filter
    let textFilter = '';
    if (sanitizedQuery !== '') {
      textFilter = `AND (
        (SELECT text FROM UNNEST(title_localized) WHERE language = 'en' LIMIT 1) LIKE '%${sanitizedQuery}%'
        OR (SELECT text FROM UNNEST(abstract_localized) WHERE language = 'en' LIMIT 1) LIKE '%${sanitizedQuery}%'
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
    
    // Execute query with retry logic
    const rows = await executeQuery(sqlQuery);
    
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
    // Return empty results instead of error
    return NextResponse.json({ 
      success: true, 
      data: [], 
      warning: "Could not retrieve patents with the provided parameters" 
    });
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