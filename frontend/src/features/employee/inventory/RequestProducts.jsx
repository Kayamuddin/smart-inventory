import AddProductRequestDialog from "./AddProductRequestDialog.jsx";
import EditProductRequestDialog from "./EditProductRequestDialog.jsx";

export default function RequestProducts({
  open,
  handleClose,
  suggestProduct = [],
  createProduct,
  updateProduct,
  selectedRequest,
}) {
  const isEditMode = Boolean(selectedRequest);

  return (
    <>
      {!isEditMode && (
        <AddProductRequestDialog
          open={open}
          handleClose={handleClose}
          suggestProduct={suggestProduct}
          createProduct={createProduct}
        />
      )}

      {isEditMode && (
        <EditProductRequestDialog
          open={open}
          handleClose={handleClose}
          selectedRequest={selectedRequest}
          updateProduct={updateProduct}
        />
      )}
    </>
  );
}
