import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import ClientLayout from "./ClientLayout";

export default async function DashboardLayout({ children }) {
  const session = await auth();
  
  if (!session) {
    redirect("/login");
  }

  return <ClientLayout>{children}</ClientLayout>;
}
