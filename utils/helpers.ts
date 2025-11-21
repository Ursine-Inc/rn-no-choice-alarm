export const cleanFileName = (fileName: string): string => {
  const regex = new RegExp(" - Output - Stereo Out\\.(m4a|aac)$");
  let cleaned = fileName.replace(regex, "");

  cleaned = cleaned.replace(/^alarm\d+/i, "");
  cleaned = cleaned.split("-")[0].trim();
  cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();

  return cleaned;
};
