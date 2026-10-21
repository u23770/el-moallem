/** Return a success toast only when persistence explicitly reports success. */
export function manualSaveResultMessage(result) {
  return result?.ok === true ? '💾 اتحفظت! تقدمك بأمان في المتصفح ده.' : null;
}
