const { createObjectCsvStringifier } = require("csv-writer");

const generateCSV = (headers, data) => {
  const csvStringifier = createObjectCsvStringifier({
    header: headers.map((h) => ({ id: h.id, title: h.title })),
  });

  const csvString =
    csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(data);

  return csvString;
};

module.exports = { generateCSV };
