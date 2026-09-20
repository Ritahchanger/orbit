// RootProductDetail.jsx
// Same domain/business resolution as RootHome, for /products/:id.
import ProductDetails from "../../products/pages/ProductDetails";
import StorefrontProductDetail from "./StorefrontProductDetail";
import { useStoreSlug } from "../hooks/useStoreSlug";

const RootProductDetail = () => {
  const slug = useStoreSlug();
  return slug ? <StorefrontProductDetail /> : <ProductDetails />;
};

export default RootProductDetail;
