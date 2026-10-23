import { CircularProgress } from "@mui/material";
import useProductTransfer from "../../hooks/useProductTransfer";
import RequestProductTable from "../../features/employee/inventory/RequestProductTable";
import PackedRequests from "../../features/employee/inventory/PackedRequests";
import { useState } from "react";
import RequestProducts from "../../features/employee/inventory/RequestProducts";

function StockRequests() {
  const {
    loadingRequests,
    productRequests,
    loadingPacked,
    packedProducts,
    deleteProductRequest,
    approveProductDelivered,
    approveProductsDelivery,
    suggestProduct,
    createProductRequest,
    updateProductRequest,
  } = useProductTransfer();

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [openRequestDialog, setOpenRequestDialog] = useState(false);

  return (
    <div className="w-full h-[calc(100vh-64px)] p-4 flex flex-col">
      <div className="w-full">
        <div className="text-[1.25rem] sm:text-[2.125rem] font-bold">
          Manage Inventory Requests
        </div>

        {loadingRequests ? (
          <div className="flex flex-1 justify-center w-full items-center">
            <CircularProgress />
          </div>
        ) : productRequests.length === 0 ? (
          <div className="text-white h-40 text-center py-5">
            No Inventory Requests found.
          </div>
        ) : (
          <RequestProductTable
            productRequests={productRequests}
            setOpenRequestDialog={setOpenRequestDialog}
            loading={loadingRequests}
            deleteProductRequest={deleteProductRequest}
            setSelectedRequest={setSelectedRequest}
            selectedRequest={selectedRequest}
          />
        )}
      </div>

      <div className="w-full">
        <div className="text-[1.25rem] sm:text-[2.125rem] font-bold">
          Manage Requests Stock
        </div>
        <PackedRequests
          loading={loadingPacked}
          packedProducts={packedProducts}
          approveProductsDelivery={approveProductsDelivery}
          approveProductDelivered={approveProductDelivered}
        />
      </div>

      <RequestProducts
        open={openRequestDialog}
        handleClose={() => {
          setSelectedRequest(null);
          setOpenRequestDialog(false);
        }}
        suggestProduct={suggestProduct}
        createProduct={createProductRequest}
        updateProduct={updateProductRequest}
        selectedRequest={selectedRequest}
      />
    </div>
  );
}

export default StockRequests;
