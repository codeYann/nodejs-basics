import { Transform } from "node:stream";

export const createMultipartFilter = (boundary: string) => {
  let isContent = false;
  let buffer = Buffer.alloc(0);

  return new Transform({
    transform(chunk, encoding, callback) {
      buffer = Buffer.concat([buffer, chunk]);

      // Find the end of headers (content starts after \r\n\r\n)
      if (!isContent && buffer.includes("\r\n\r\n")) {
        const headerEnd = buffer.indexOf("\r\n\r\n");
        const contentStart = headerEnd + 4;
        isContent = true;
        buffer = buffer.slice(contentStart);
      }

      // Look for boundary markers in the content
      if (isContent && buffer.length > 0) {
        const str = buffer.toString();
        let boundaryPos = -1;

        // Find the position of the next boundary or closing boundary
        if (str.includes(`\r\n--${boundary}--`)) {
          boundaryPos = str.indexOf(`\r\n--${boundary}--`);
        } else if (str.includes(`\r\n--${boundary}\r\n`)) {
          boundaryPos = str.indexOf(`\r\n--${boundary}\r\n`);
        } else if (str.includes(`--${boundary}--`)) {
          boundaryPos = str.indexOf(`--${boundary}--`);
        }

        if (boundaryPos >= 0) {
          // Send content up to boundary
          callback(null, buffer.slice(0, boundaryPos));
          buffer = Buffer.alloc(0);
          this.push(null);
        } else if (buffer.length > boundary.length + 20) {
          // Send most data, keep last chunk for boundary checking
          const keepSize = boundary.length + 20;
          const toSend = buffer.slice(0, buffer.length - keepSize);
          callback(null, toSend);
          buffer = buffer.slice(buffer.length - keepSize);
        }
      }
    },

    flush(callback) {
      if (buffer.length > 0) {
        callback(null, buffer);
      } else {
        callback();
      }
    },
  });
};
