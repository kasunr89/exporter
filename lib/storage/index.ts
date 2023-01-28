import * as fs from 'fs';
import * as stream from 'stream';
import s3 from 'aws-sdk/clients/s3';

import { CSV } from '../exporter';

export const getStorage = (type: string, filename: string, path: string) => {
    switch (type) {
        case 'file':
            return new FileStorage(filename, path);

        case 's3':
            return new S3Storage(filename);

        default:
            throw new Error('unknown storage type');
    }
}

class BaseStorage {
    _filename;

    constructor(filename: string) {
        this._filename = filename;
    }
}

class FileStorage extends BaseStorage {
    #path;
    constructor(filename: string, path: string) {
        super(filename);

        this.#path = path;
    }

    setWriteableStream(csvStream: CSV) {
        const writeStream = fs.createWriteStream(`${this.#path}${this._filename}`);
        csvStream.pipe(writeStream);
    }

    async save() {
        return true;
    }
}

class S3Storage extends BaseStorage {
    #instance;
    #stream;

    constructor(filename: string) {
        super(filename);

        this.#stream = new stream.PassThrough();
		this.#instance = new s3({
            apiVersion: "2006-03-01",
            accessKeyId: "AKIATJG2ORJYKQOZ5R5E",
            secretAccessKey: "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",
        });
    }

    setWriteableStream(csvStream: CSV) {
        csvStream.pipe(this.#stream);
    }

    async save() {
		const params = { Bucket: 'xlsx-uploading', Key: this._filename };

        console.log('start uploading');
        const upload = await this.#instance.upload(Object.assign({}, params, {
            Body: this.#stream,
            ContentType: 'text/csv',
            ContentDisposition: 'attachment',
        })).promise();
        console.log('end uploading');
        console.log(upload);

        const head = await this.#instance.headObject(params).promise();

        return Object.assign({}, upload, head);	
    }
}