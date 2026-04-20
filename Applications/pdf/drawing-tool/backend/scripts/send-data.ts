import { HttpClientBuilder } from '@monorepo/core-http-messages-http-client';
import {
  HeaderName,
  HeadersBuilder,
  HttpRequestMessageBuilder,
} from '@monorepo/core-http-messages';

type Rectangle = { x: number; y: number; width: number; height: number };

function randomRect(): Rectangle {
  return {
    x: Math.floor(Math.random() * 800),
    y: Math.floor(Math.random() * 600),
    width: Math.floor(Math.random() * 200) + 1,
    height: Math.floor(Math.random() * 200) + 1,
  };
}

async function main(): Promise<void> {
  const payload = {
    rectangles: Array.from({ length: 10 }, randomRect),
  };

  const headers = new HeadersBuilder()
    .with(HeaderName.Accept, 'application/json')
    .with(HeaderName.ContentType, 'application/json')
    .build();

  const request = new HttpRequestMessageBuilder()
    .withMethod('POST')
    .withPath('http://127.0.0.1:3000/api/commands/save')
    .withHeaders(headers)
    .withBody(payload)
    .build();

  const client = new HttpClientBuilder().build();
  const response = await client.send(request);

  console.log(response.statusCode);
  console.log(JSON.stringify(response.body, null, 2));
}

void main();
