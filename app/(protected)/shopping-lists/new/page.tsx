import { redirect } from "next/navigation";

export default function NewShoppingListPage() {
  // Creation currently happens via the CreateListDialog from the dashboard
  // and shopping-lists pages. This route is reserved for a dedicated
  // full-page creation flow in Phase 2.
  redirect("/shopping-lists");
}
