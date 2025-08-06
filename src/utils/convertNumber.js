export function convertToBanglaDigits(input) {
  const enToBn = {
    '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
    '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'
  };
  return input.toString().replace(/[0-9]/g, (d) => enToBn[d]);
}
export function convertToEnglishDigits(input) {
  const bnToEn = {
    '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
    '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
  };
  return input.toString().replace(/[০-৯]/g, (d) => bnToEn[d]);
}
