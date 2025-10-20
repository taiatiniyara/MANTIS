import { redirect } from "next/navigation";

/**
 * Home page - Internal system only
 * Redirects to login page for staff authentication
 */
export default function Home() {
  // MANTIS is an internal system - redirect to login
  redirect("/auth/login");
}
