import AdminAddProductModal from "../../products/components/AddProductModal";
import SellModal from "../../products/modals/SellingModal";
import GamingProductModal from "../../../globals/modals/product-modal/ProductModal";
import UserRegistrationModal from "../UserRegistrationModal";
import GlobalDeleteConfirmationModal from "../../../globals/modals/global-delete-modal/GlobalDeleteConfirmationModal";
import UserDetailsModal from "../../../globals/users/userDetailsModal";
import POSPaymentModal from "../../pos/modals/pos-modal";
import AIResultsModal from "../../ai-results/ai-results.modal";
import CategoryModal from "../CategoryModal";
import { useSelector } from "react-redux";

const AdminModalRoot = () => {
  const categoriesModal = useSelector(
    (state) => state.categoryModal.categoriesModal,
  );
  return (
    <>
      <AdminAddProductModal />
      <SellModal />
      <GamingProductModal />
      <UserRegistrationModal />
      <GlobalDeleteConfirmationModal />
      <UserDetailsModal />
      <AIResultsModal />
      <POSPaymentModal />
      {categoriesModal && <CategoryModal />}
    </>
  );
};

export default AdminModalRoot;
