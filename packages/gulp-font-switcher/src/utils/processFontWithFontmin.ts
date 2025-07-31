import type Fontmin from 'fontmin';

import type { FileVinyl } from '@/shared/schemas';

// Function to process the file through Fontmin.
export const processFontWithFontmin = (file: FileVinyl, fontmin: Fontmin): Promise<any> => {
  return new Promise((resolve, reject) => {
    fontmin.run((err, files) => {
      if (err) {
        return reject(new Error(`Error processing ${file.relative}: ${err.message}` ));
      }

      if (!files?.length) {
        return reject(new Error(`No output files generated for ${file.relative}`));
      }

      const outputFile = files[0];
      if (!outputFile) {
        return reject(new Error(`No contents in output file for ${file.relative}`));
      }

      resolve(outputFile);
    });
  });
};
