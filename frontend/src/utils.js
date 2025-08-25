export function toInputDateTimeLocal(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function toISOFromLocal(inputValue) {
  // inputValue est un string "YYYY-MM-DDTHH:mm"
  if (!inputValue) return null;
  const d = new Date(inputValue);
  return d.toISOString();
}
