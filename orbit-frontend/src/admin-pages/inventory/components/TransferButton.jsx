import { useState } from 'react';

import StockTransferModal from './StoreTransferModal';

const TransferButton = () => {

  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg"
      >
        Transfer Stock
      </button>

      <StockTransferModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode="single"
        onSuccess={(result) => {
          console.log('Transfer successful:', result);
        }}
      />
    </>
  );
};

export { TransferButton }