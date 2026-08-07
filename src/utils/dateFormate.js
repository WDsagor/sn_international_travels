import { format, parseISO } from "date-fns";
export const formatDateForInput = (dateString) => {
  if (!dateString) return "";
  return format(parseISO(dateString), "yyyy-MM-dd");
};

export const formatDate = (dateString) => {
  const parsedDate = parseISO(dateString);
  const formatted = format(parsedDate, "dd MMM, yyyy");
  return formatted;
};

export const formatCurrency = (amount) => {
  const val = Number(amount);
  return isNaN(val) ? "৳0" : `৳${val.toLocaleString("en-BD")}`;
};
export const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
