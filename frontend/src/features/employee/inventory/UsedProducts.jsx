import { Package, Boxes } from "lucide-react";

const UsedProducts = ({ products = [] }) => {
  return (
    <div className="mb-5">
      {/* Product List */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4">
          <h3 className="font-semibold text-gray-900">Used product of Today</h3>
        </div>

        {products.length === 0 ? (
          <div className="flex flex-col items-center px-5 py-12 text-center">
            <div className="rounded-full bg-gray-100 p-4">
              <Boxes size={30} className="text-gray-400" />
            </div>

            <p className="mt-4 font-medium text-gray-800">
              No products used today
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Used products will appear here when recorded.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto ">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Product</th>
                  <th className="px-5 py-3 text-right font-semibold">
                    Quantity Used
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {products.map((item) => (
                  <tr
                    key={item.product?._id}
                    className="transition hover:bg-gray-50"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-gray-100 p-2">
                          <Package size={18} className="text-gray-600" />
                        </div>

                        <span className="font-medium text-gray-800">
                          {item.product?.name || "Unknown product"}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <span className="inline-flex min-w-12 items-center justify-center rounded-lg bg-orange-50 px-3 py-1.5 font-semibold text-orange-700">
                        {Number(item.quantity).toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsedProducts;
