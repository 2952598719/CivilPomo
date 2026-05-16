import { NextRequest, NextResponse } from "next/server";

interface NarrativeRequest {
  nodeName: string;
  nodeDescription: string;
  currentPomodoro: number;
  totalPomodoros: number;
  prerequisiteDescriptions: string[];
}

export async function POST(request: NextRequest) {
  const body: NarrativeRequest = await request.json();

  const baseUrl = process.env.AI_BASE_URL;
  const apiKey = process.env.AI_API_KEY;
  const modelName = process.env.AI_MODEL_NAME;

  if (!baseUrl || !apiKey || !modelName) {
    return NextResponse.json(
      { error: "AI configuration missing" },
      { status: 500 }
    );
  }

  const prerequisiteContext =
    body.prerequisiteDescriptions.length > 0
      ? `\n已完成的前置技术：${body.prerequisiteDescriptions.join("；")}`
      : "";

  const prompt = `你是一个沉浸式叙事生成器。

当前节点：${body.nodeName}
节点描述：${body.nodeDescription}
进度：第 ${body.currentPomodoro} / 共 ${body.totalPomodoros} 个番茄${prerequisiteContext}

请用第二人称（"你"）描述当前正在发生的事情。
要求：
- 描述具体发生的事件或场景，不要历史总结
- 不要出现"萌芽""发展""进步"这类抽象词汇
- 画面感强，像在描述一个场景
- 50-100 字
- 只输出叙事文本，不要其他内容`;

  try {
    const response = await fetch(`${baseUrl}/v1/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: modelName,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 300,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `AI API error: ${errorText}` },
        { status: 502 }
      );
    }

    const data = await response.json();
    const textBlock = data.content?.find(
      (b: { type: string }) => b.type === "text"
    );
    const narrative = textBlock?.text?.trim();

    if (!narrative) {
      return NextResponse.json(
        { error: "Empty response from AI" },
        { status: 502 }
      );
    }

    return NextResponse.json({ narrative });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to call AI: ${error}` },
      { status: 500 }
    );
  }
}