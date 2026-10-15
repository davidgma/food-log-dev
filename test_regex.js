const fs = require('fs');
let html = `
<body bgcolor="#A0A0A0" vlink="blue" link="blue">
<div id="page1-div" style="position:relative;width:892px;height:1262px;">
<img width="892" height="1262" src="20260821 groceries w001.png" alt="background image"/>
<p style="position:absolute;top:1006px;left:197px;white-space:nowrap" class="ft112"><a href="...">Waitrose Duchy Organic Brazil Nuts<br/></a>150g</p>
<p style="position:absolute;top:1008px;left:629px;white-space:nowrap" class="ft18"><b>Qty:</b></p>
<p style="position:absolute;top:1008px;left:669px;white-space:nowrap" class="ft13">1</p>
<p style="position:absolute;top:1008px;left:771px;white-space:nowrap" class="ft13">£4.00</p>
</div>
</body>
`;

// 1. Add Tailwind
html = html.replace('</head>', '<script src="https://cdn.tailwindcss.com"></script>\n<style>p { margin-bottom: 0.5rem; } a { color: #2563eb; text-decoration: none; }</style>\n</head>');

// 2. Fix body
html = html.replace(/<body[^>]*>/i, '<body class="bg-gray-50 text-gray-800 font-sans max-w-2xl mx-auto p-4 md:p-8 bg-white shadow-lg my-8 rounded-lg">');

// 3. Remove background images
html = html.replace(/<img[^>]*alt="background image"[^>]*>/gi, '');

// 4. Fix page divs
html = html.replace(/<div[^>]*id="page\d+-div"[^>]*>/gi, '<div class="page-container border-b border-gray-200 pb-8 mb-8 last:border-0">');

// 5. Fix absolute paragraphs
html = html.replace(/style="position:absolute;top:\d+px;left:\d+px;white-space:nowrap"/gi, 'class="text-sm md:text-base"');

console.log(html);
