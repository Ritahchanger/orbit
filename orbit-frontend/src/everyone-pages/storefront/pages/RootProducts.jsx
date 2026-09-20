// RootProducts.jsx
// Same domain/business resolution as RootHome, for the /products,
// /products/category/:category, /category/:category and /brand/:brand
// marketing catalog paths. StorefrontHome already is the full, filterable
// product catalog, so it's reused as-is rather than duplicated.
import Products from "../../products/pages/Products";
import StorefrontHome from "./StorefrontHome";
import { useStoreSlug } from "../hooks/useStoreSlug";

const RootProducts = () => {
  const slug = useStoreSlug();
  return slug ? <StorefrontHome /> : <Products />;
};

export default RootProducts;
