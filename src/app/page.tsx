import { redirect } from "next/navigation";

// La ruta raíz redirige al login (Task 1.2 implementará la lógica de auth completa)
export default function Home() {
  redirect("/login");
}
