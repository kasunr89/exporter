import * as fs from 'fs';

import { getExporter } from './lib/exporter';
import { getStorage } from './lib/storage';

const run = async () => {
   

    const readStream = fs.createReadStream('./data/person-info.json');

    const chunks = []
    for await (const chunk of readStream) {
        chunks.push(chunk)
    }

    const data = JSON.parse(Buffer.concat(chunks).toString());

    const streamer = getExporter('csv', { header: true});
    const storage = getStorage('s3', `${Math.random()}.csv`, '');

    storage.setWriteableStream(streamer);
    storage.save();

    console.log('start wrting 1')

    for (const row of data) {
        streamer.streamRow(row);
    }

    console.log('endoing writing 1')

    console.log('start waiting');
    await sleep(3000);
    console.log('end waiting');

    console.log('start writing 2')
    for (const row of data) {
        streamer.streamRow(row);
    }
    console.log('endoing writing 2')

    streamer.end();

    console.log('ended stream')
}

const sleep = (time: number) => {
    return new Promise((resolve) => {
        setTimeout(() => resolve(true), time)
    });
}

run();

