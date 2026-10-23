import { Typography } from "@mui/material";
import RequestTable from "../../features/supplier/StockRequests/RequestTable.jsx";
import useProductTransfer from "../../hooks/useProductTransfer.js";
import PackedRequests from "../../features/supplier/StockRequests/PackedRequests.jsx";
function StockRequests() {
  const {
    loadingRequests,
    approveRequestProduct,
    productRequests,
    loadingPacked,
    packedProducts,
    transferPackedProduct,
    // refresh,
    // search,
    // setSearch,
    addProductToPackaging,
  } = useProductTransfer();

  return (
    <div className="w-full h-[calc(100vh-64px)] p-4 flex flex-col">
      <div className="text-[1.25rem] sm:text-[2.125rem] font-bold">
        Manage Inventory Requests
      </div>

      <RequestTable
        productRequests={productRequests}
        loading={loadingRequests}
        addProductToPackaging={addProductToPackaging}
        approveRequestProduct={approveRequestProduct}
      />

      <div className="text-xl sm:text-4xl pb-3">Manage Packed Inventory</div>
      <PackedRequests
        loading={loadingPacked}
        transferPackedProduct={transferPackedProduct}
        packedProducts={packedProducts}
      />
    </div>
  );
}

export default StockRequests;
