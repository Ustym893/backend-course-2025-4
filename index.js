import { Command } from 'commander';
import http from 'http';
import fs from 'fs';

const program = new Command();

program
  .requiredOption('-i, --input <path>', 'шлях до файлу для читання')
  .requiredOption('-р, --host <host>', 'адреса сервера')
  .requiredOption('-p, --port <port>', 'порт сервера');

program.parse(process.argv);
const options = program.opts();

if (!fs.existsSync(options.input)) {
  console.error('Файл не існує:', options.input);
  process.exit(1);
}

const fileContent = fs.readFileSync(options.input, 'utf-8');

const server = http.createServer((req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/postcssPluginWarning; charset=utf-8',
  });
  res.end('Вміст файлу ${options.input}:\n\n${fileContent}');
});

server.listen(Number(options.port), options.host, () => {
  console.log(`Сервер запущено на http://${options.host}:${options.port}`);
});
