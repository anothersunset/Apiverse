// Next.js API Route - AI代码生成
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { apiInfo, language = 'javascript' } = body;

    if (!apiInfo) {
      return NextResponse.json({ error: '请提供API信息' }, { status: 400 });
    }

    const hasAuth = apiInfo.auth && apiInfo.auth !== 'No';
    let code = '';

    if (language === 'javascript') {
      code = `// ${apiInfo.name} - JavaScript调用示例
const response = await fetch('${apiInfo.url || 'https://api.example.com'}', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    ${hasAuth ? `'Authorization': 'Bearer YOUR_API_KEY',` : ''}
  },
});
const data = await response.json();
console.log(data);`;
    } else if (language === 'python') {
      code = `# ${apiInfo.name} - Python调用示例
import requests
response = requests.get(
    "${apiInfo.url || 'https://api.example.com'}",
    headers={"Content-Type": "application/json"${hasAuth ? ', "Authorization": "Bearer YOUR_API_KEY"' : ''}}
)
data = response.json()
print(data)`;
    } else {
      code = `# ${apiInfo.name} - cURL调用示例
curl -X GET "${apiInfo.url || 'https://api.example.com'}" \\
  -H "Content-Type: application/json"${hasAuth ? ' \\\n  -H "Authorization: Bearer YOUR_API_KEY"' : ''}`;
    }

    return NextResponse.json({
      success: true,
      language,
      code
    });
  } catch (error) {
    return NextResponse.json({ error: '请求处理失败' }, { status: 500 });
  }
}
