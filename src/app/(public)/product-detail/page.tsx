import { redirect } from "next/navigation";

/* Product pages live at /product-detail/[slug]; without one there is nothing
   to show, so send visitors to the catalog. */
export default function ProductDetailIndex() {
  redirect("/shop");
}
