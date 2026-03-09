import { useDispatch, useSelector } from 'react-redux';

import { openModal, closeModal, updateModalContent } from '../../admin-pages/products/redux/more-user-slice';

export const useUserModal = () => {

    const dispatch = useDispatch();

    const modalState = useSelector((state) => state.userModal);

    const handleOpenModal = ({ title, content, size, position, userData, onClose }) => {
        dispatch(openModal({ title, content, size, position, userData, onClose }));
    };


    const handleCloseModal = () => {
        dispatch(closeModal());
    };


    const handleUpdateContent = ({ title, content, userData }) => {
        dispatch(updateModalContent({ title, content, userData }));
    };

    
    return {
        isOpen: modalState.isOpen,
        title: modalState.title,
        content: modalState.content,
        size: modalState.size,
        position: modalState.position,
        userData: modalState.userData,
        openModal: handleOpenModal,
        closeModal: handleCloseModal,
        updateModalContent: handleUpdateContent,
    };
};