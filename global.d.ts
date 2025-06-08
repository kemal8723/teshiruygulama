// global.d.ts

// This file provides global type definitions, particularly for libraries loaded via <script> tags.

declare global {
  interface Window {
    /**
     * Represents the XLSX library object, typically available globally
     * when the library is included via a script tag.
     */
    XLSX: {
      utils: {
        /**
         * Converts an array of arrays of JS data to a worksheet.
         * @param data Array of arrays of JS data.
         * @param opts Optional options.
         * @returns A worksheet object.
         */
        aoa_to_sheet: (data: any[][], opts?: any) => any;
        /**
         * Converts a worksheet object to an array of JSON objects.
         * @param worksheet The worksheet object.
         * @param opts Optional options.
         * @returns An array of JSON objects.
         */
        sheet_to_json: (worksheet: any, opts?: any) => any[][];
        /**
         * Creates a new workbook.
         * @returns A new workbook object.
         */
        book_new: () => any;
        /**
         * Appends a worksheet to a workbook.
         * @param workbook The workbook object.
         * @param worksheet The worksheet object.
         * @param sheetName The name of the sheet.
         */
        book_append_sheet: (workbook: any, worksheet: any, sheetName: string) => void;
      };
      /**
       * Writes a workbook object to a file.
       * @param workbook The workbook object.
       * @param filename The name of the file to write.
       * @param opts Optional options.
       */
      writeFile: (workbook: any, filename: string, opts?: any) => void;
    };
  }
}

// Adding this export {} makes the file a module, which is a good practice for .d.ts files
// ensuring that the declarations are treated as global augmentations.
export {};
