const fs = require('fs');
let code = fs.readFileSync('src/lib/generator.ts', 'utf-8');

const replacementHTML = `                        \${(groceryImagesByDate[date] || []).map((file, idx) => \`
                            <details id='details-grocery-image-\${date}-\${idx}' class='group/grocery-image mt-2 pt-2 \${(daysFoodListByDate[date]?.length) ? "border-t border-gray-100" : ""}'>
                              <summary class='flex items-start gap-3 cursor-pointer list-none outline-none'>
                                <span class='text-2xl leading-none mt-0.5'>🛒</span>
                                <div class='flex-1 flex items-center mt-1'>
                                  <span class='font-bold text-lg text-blue-600 transition-colors group-hover/grocery-image:underline'>Forest Whole Foods Grocery Delivery</span>
                                  <span class='ml-2 text-sm opacity-50 transition-transform duration-300 group-open/grocery-image:-rotate-180'>▼</span>
                                </div>
                              </summary>
                              <div class='ml-9 mt-2'>
                                <img src="./\${file}" alt="Forest Whole Foods Grocery Delivery" class="max-w-full h-auto border border-gray-200 rounded-md shadow-sm" />
                              </div>
                            </details>
                        \`).join('')}
                        
                        \${(groceriesByDate[date] || []).map(file => {`;

code = code.replace("                        ${(groceriesByDate[date] || []).map(file => {", replacementHTML);

const pt2Replacement = `                            <div class='flex items-center gap-3 pt-2 \${(daysFoodListByDate[date]?.length || groceryImagesByDate[date]?.length) ? "border-t border-gray-100" : ""}'>`;
code = code.replace(`                            <div class='flex items-center gap-3 pt-2 \${daysFoodListByDate[date]?.length ? "border-t border-gray-100" : ""}'>`, pt2Replacement);

const nutritionPt2Replacement = `                            <div class='flex items-center gap-3 pt-2 \${(daysFoodListByDate[date]?.length || groceryImagesByDate[date]?.length || groceriesByDate[date]?.length) ? "border-t border-gray-100" : ""}'>`;
code = code.replace(`                            <div class='flex items-center gap-3 pt-2 \${(daysFoodListByDate[date]?.length || groceriesByDate[date]?.length) ? "border-t border-gray-100" : ""}'>`, nutritionPt2Replacement);

fs.writeFileSync('src/lib/generator.ts', code, 'utf-8');
