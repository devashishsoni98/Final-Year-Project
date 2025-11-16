const baseBookstoreUrl = "http://localhost:5173";

export const constructBookstoreUrl = (path = "/") => {
  return `${baseBookstoreUrl}${path}`;
};

export const getStoreUrl = () => {
  return constructBookstoreUrl("/");
};

export const getBookDetailsUrl = (bookId) => {
  if (!bookId) return getStoreUrl();
  return constructBookstoreUrl(`/book/${bookId}`);
};

export const getCartUrl = () => {
  return constructBookstoreUrl("/cart");
};

export const getPaymentUrl = () => {
  return constructBookstoreUrl("/payment");
};

export const getOrdersUrl = () => {
  return constructBookstoreUrl("/orders");
};
