//初始化deepseek
import { ChatDeepSeek } from '@langchain/deepseek';
import { ConfigService } from '@nestjs/config';
import { PostgresSaver } from '@langchain/langgraph-checkpoint-postgres';

interface BochaWebPageItem {
  name?: string;
  url?: string;
  summary?: string;
  siteName?: string;
  siteIcon?: string;
  dateLastCrawled?: string;
}

interface BochaSearchResponse {
  data?: {
    webPages?: {
      value?: BochaWebPageItem[];
    };
  };
}
//初始化deepseek chat对话模型
export const createDeepSeek = () => {
  const configService = new ConfigService();
  return new ChatDeepSeek({
    apiKey: configService.get<string>('DEEPSEEK_API_KEY'), //环境变量获取apikey
    model: configService.get<string>('DEEPSEEK_API_MODEL'), //环境变量获取模型
    temperature: 1.3, //1.3翻译 + 通用对话
    maxTokens: 4396, //最大token数
    streaming: true, //是否流式返回
  });
};
//带深度思考的模型
export const createDeepSeekReasoner = () => {
  const configService = new ConfigService();
  return new ChatDeepSeek({
    apiKey: configService.get<string>('DEEPSEEK_API_KEY'), //环境变量获取apikey
    model: configService.get<string>('DEEPSEEK_REASONER_API_MODEL'), //环境变量获取模型
    temperature: 1.3, //1.3翻译 + 通用对话
    maxTokens: 18000, //最大token数
    streaming: true, //是否流式返回
  });
};
//checkpoint初始化
export const createCheckpoint = async () => {
  const configService = new ConfigService();
  const checkpoint = PostgresSaver.fromConnString(
    configService.get<string>('AI_DATABASE_URL')!,
  );
  await checkpoint.setup();
  return checkpoint;
};
//初始化狛查搜索API
export const createBochaSearch = async (query: string, count: number = 10) => {
  const configService = new ConfigService();
  const result = await fetch(
    `${configService.get<string>('BOCHA_SEARCH_URL')}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${configService.get<string>('BOCHA_API_KEY')}`,
      },
      body: JSON.stringify({
        query, //查询内容
        count, //查询数量
        summary: true, //摘要
      }),
    },
  );
  const json = (await result.json()) as BochaSearchResponse;
  const values = Array.isArray(json.data?.webPages?.value)
    ? json.data.webPages.value
    : [];
  const prompt = values.map(
    (item) => `
    标题：${item.name ?? ''}
    链接：${item.url ?? ''}
    摘要：${item?.summary?.replace(/\n/g, '') ?? ''}
    网站名称：${item.siteName ?? ''}
    网站logo：${item.siteIcon ?? ''}
    发布时间：${item.dateLastCrawled ?? ''}
    `,
  );
  return prompt;
};
