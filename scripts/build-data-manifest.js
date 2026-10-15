import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const REMOTE_BASE_URL = 'https://filedn.com/l8l3tmJlFBQbibudQ3R2XYu/food-data/';

async function buildManifest() {
  console.log('Fetching directory index from pCloud:', REMOTE_BASE_URL);
  
  const fileSet = new Set();
  const dateSet = new Set();
  let htmlContent = '';

  try {
    const res = await fetch(REMOTE_BASE_URL);
    if (res.ok) {
      htmlContent = await res.text();
    }
  } catch (err) {
    console.error('Failed to fetch pCloud root directory:', err);
  }

  if (htmlContent) {
    // Extract filenames from quotes, hrefs, src
    const fileRegex = /["'](?:[.\/]*)(202\d{5}[^"'\?#]+\.(?:pdf|html|htm|txt|png|jpg|jpeg))["']/gi;
    let m;
    while ((m = fileRegex.exec(htmlContent)) !== null) {
      const fn = decodeURIComponent(m[1]).replace(/^\.\//, '').trim();
      if (fn !== 'index.html' && fn !== 'CNAME' && !fn.endsWith('.svg')) {
        fileSet.add(fn);
        const dm = fn.match(/^(202\d{5})/);
        if (dm) dateSet.add(dm[1]);
      }
    }

    // Match all 8-digit date strings YYYYMMDD
    const dateRegex = /\b(202\d{5})\b/g;
    while ((m = dateRegex.exec(htmlContent)) !== null) {
      dateSet.add(m[1]);
    }
  }

  // Ensure summary file for each date is included
  dateSet.forEach((date) => {
    fileSet.add(`${date} summary.txt`);
  });

  const sortedDates = Array.from(dateSet).sort((a, b) => b.localeCompare(a));
  const allFiles = Array.from(fileSet);

  console.log(`Found ${sortedDates.length} dates and ${allFiles.length} files.`);

  // Fetch overview.md
  let overviewMarkdown = '# The Theory\nNo theory overview found.';
  try {
    const ovRes = await fetch(REMOTE_BASE_URL + 'overview.md');
    if (ovRes.ok) {
      overviewMarkdown = await ovRes.text();
      if (overviewMarkdown.startsWith('data:')) {
        const commaIdx = overviewMarkdown.indexOf(',');
        if (commaIdx !== -1) {
          try {
            overviewMarkdown = Buffer.from(overviewMarkdown.substring(commaIdx + 1), 'base64').toString('utf-8');
          } catch (e) {
            console.warn('Failed to decode base64 overviewMarkdown:', e);
          }
        }
      }
      console.log('Successfully fetched overview.md (length:', overviewMarkdown.length, ')');
    }
  } catch (err) {
    console.warn('Could not fetch overview.md:', err);
  }

  // Fetch all summary texts in parallel/batches
  const summaries = {};
  console.log('Fetching summary text files for each date...');
  
  const fetchTasks = sortedDates.map(async (date) => {
    const summaryFileName = `${date} summary.txt`;
    const summaryUrl = REMOTE_BASE_URL + encodeURIComponent(summaryFileName);
    try {
      const res = await fetch(summaryUrl);
      if (res.ok) {
        let text = await res.text();
        if (text && text.startsWith('data:')) {
          const commaIdx = text.indexOf(',');
          if (commaIdx !== -1) {
            try {
              text = Buffer.from(text.substring(commaIdx + 1), 'base64').toString('utf-8');
            } catch (e) {}
          }
        }
        if (text && text.length > 0) {
          summaries[date] = text;
        }
      }
    } catch (err) {
      // Ignore individual failures
    }
  });

  await Promise.all(fetchTasks);

  console.log(`Successfully fetched ${Object.keys(summaries).length} summary files.`);

  const manifest = {
    lastUpdated: new Date().toISOString(),
    hasOverview: overviewMarkdown.length > 50,
    overviewMarkdown,
    sortedDates,
    allFiles,
    summaries,
  };

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const publicDir = path.join(__dirname, '..', 'public');

  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const manifestPath = path.join(publicDir, 'data-manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
  console.log(`Wrote manifest to ${manifestPath} (${(fs.statSync(manifestPath).size / 1024).toFixed(1)} KB)`);
}

buildManifest().catch((err) => {
  console.error('Error building manifest:', err);
});
