import * as csv from 'fast-csv';
import * as stream from 'stream';

export const getExporter = (type: string, options: unknown) => {
    switch (type) {
        case 'csv':
            return new CSV(options as csv.FormatterOptionsArgs<csv.FormatterRow, csv.FormatterRow>);

        default:
            throw new Error('unknown exporter type');
    }
}

export class CSV {
    #instance;
    constructor(options: csv.FormatterOptionsArgs<csv.FormatterRow, csv.FormatterRow>) {
        this.#instance = csv.format(options);
    }

    streamColumn(column: unknown) {
        this.#instance.write(column);
    }

    streamRow(row: unknown): void {
        this.#instance.write(row);
    }

    pipe(writeable: unknown) {
        this.#instance.pipe(writeable as stream.Writable);
    }

    end() {
        this.#instance.end();
    }
}