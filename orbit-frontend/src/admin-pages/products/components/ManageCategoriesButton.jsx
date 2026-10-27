import { Tags } from "lucide-react";
import { useDispatch } from "react-redux";
import { openCategoriesModal } from "../../../store/features/categoryModalSlice";
import { useAuth } from "../../../context/authentication/AuthenticationContext";

// Roles allowed to change categories (the API requires products.update)
const CATEGORY_MANAGER_ROLES = ["manager", "admin", "superadmin"];

// Opens the category manager. Hidden for roles that can't change categories.
const ManageCategoriesButton = ({ className = "" }) => {
  const dispatch = useDispatch();
  const { userRole } = useAuth();

  if (!CATEGORY_MANAGER_ROLES.includes(userRole)) return null;

  return (
    <button
      type="button"
      onClick={() => dispatch(openCategoriesModal())}
      className={`inline-flex items-center gap-2 rounded-sm border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 ${className}`}
    >
      <Tags size={16} />
      Categories
    </button>
  );
};

export default ManageCategoriesButton;
