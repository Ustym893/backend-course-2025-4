import { Command } from 'commander';
import http from 'http';
import fs from 'fs';
import { XMLBuilder } from 'fast-xml-parser';
import url from 'url';

const program = new Command();

program
  .requiredOption('-i, --input <path>', 'шлях до JSON файлу для читання')
  .requiredOption('-h, --host <host>', 'адреса сервера')
  .requiredOption('-p, --port <port>', 'порт сервера');

program.parse(process.argv);
const options = program.opts();

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const query = parsedUrl.query;

  fs.readFile(options.input, 'utf-8', (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Cannot find input file');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Error reading file: ' + err.message);
      }
      return;
    }

    let houses;

    try {
      houses = JSON.parse(data);
    } catch (parseErr) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Invalid JSON format');
      return;
    }

    let filtered = houses;
    if (query.furnished === 'true') {
      filtered = filtered.filter((h) => h.furnishingstatus === 'furnished');
    }
    if (query.max_price) {
      const max = Number(query.max_price);
      filtered = filtered.filter((h) => h.price < max);
    }

    const builder = new XMLBuilder({ format: true });
    const xml = builder.build({
      houses: {
        house: filtered.map((h) => ({
          price: h.price,
          area: h.area,
          furnishingstatus: h.furnishingstatus,
        })),
      },
    });

    res.writeHead(200, { 'Content-Type': 'application/xml; charset=utf-8' });
    res.end(xml);
  });
});

server.listen(Number(options.port), options.host, () => {
  console.log(`Сервер запущено на http://${options.host}:${options.port}`);
});
